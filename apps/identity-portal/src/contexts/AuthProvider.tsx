import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { AuthContextCreated } from "./AuthContextCreated";
import identityService, { type AuthResponse, type UserInfo } from '../api/identityService';
import type { LoginRequest, RegisterRequest } from '../api/identityService';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Logout user
  const logout = useCallback(async () => {
    setIsLoading(true);
    
    try {
      await identityService.logout();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear auth state regardless of API response
      // Remove items one by one to ensure storage events are triggered properly
      // This ensures other apps can detect the logout
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=asafarim.local';
      document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=asafarim.local';
      document.cookie = 'user_info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=asafarim.local';
      
      // Dispatch a custom event for local listeners
      window.dispatchEvent(new Event('auth-signout'));
      
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((authResponse: AuthResponse) => {
    const { token, refreshToken, user } = authResponse;
    
    // Store tokens and user info
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
    localStorage.setItem('user_info', JSON.stringify(user));
    
    setUser(user);
    setError(null);
  }, []);

  // Refresh authentication token
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const authResponse = await identityService.refreshToken(refreshToken);
      handleAuthSuccess(authResponse);
      return true;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      await logout();
      return false;
    }
  }, [handleAuthSuccess, logout]);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem('user_info');
      const token = localStorage.getItem('auth_token');
      
      if (storedUser && token) {
        try {
          // Parse stored user info
          const userInfo = JSON.parse(storedUser) as UserInfo;
          setUser(userInfo); // Set user immediately from localStorage to prevent flicker
          
          // Validate the token with the server
          try {
            // First try to get the profile with the current token
            console.log('Validating token by fetching user profile...');
            const profile = await identityService.getProfile();
            console.log('Token is valid, user profile retrieved:', profile);
            setUser(profile); // Update with latest user info
          } catch (profileError) {
            console.log('Profile fetch failed, attempting token refresh...', profileError);
            
            // Token might be expired, try to refresh
            try {
              const refreshSuccess = await refreshAuthToken();
              console.log('Token refresh result:', refreshSuccess ? 'success' : 'failed');
              
              if (!refreshSuccess) {
                console.log('Keeping user session active despite refresh failure');
              }
            } catch (refreshError) {
              console.warn('Token refresh failed; keeping local session to avoid redirect loop:', refreshError);
              // Intentionally do not logout here to prevent redirect loops
            }
          }
        } catch (error) {
          console.error('Failed to restore authentication state:', error);
          // Only logout if we can't parse the stored user data
          await logout();
        }
      } else {
        console.log('No stored authentication found');
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, [logout, refreshAuthToken]);

  // Login user
  const login = useCallback(async (data: LoginRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authResponse = await identityService.login(data);
      handleAuthSuccess(authResponse);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Register new user
  const register = useCallback(async (data: RegisterRequest): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authResponse = await identityService.register(data);
      handleAuthSuccess(authResponse);
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update user profile
  const updateUser = useCallback((userData: Partial<UserInfo>) => {
    setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
  }, []);

  // Reload user profile
  const reloadProfile = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUser = await identityService.getProfile();
      setUser(updatedUser);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reload profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return (
    <AuthContextCreated.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
        updateUser,
        reloadProfile,
        login,
        register,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContextCreated.Provider>
  );
};

export default AuthProvider;
