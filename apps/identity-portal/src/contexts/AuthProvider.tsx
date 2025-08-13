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
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
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
          setUser(userInfo);
          
          // Optionally validate the token with the server
          // This could be done by calling getProfile() to verify the token is still valid
          try {
            const profile = await identityService.getProfile();
            setUser(profile); // Update with latest user info
          } catch {
            // Token might be expired, try to refresh
            await refreshAuthToken();
          }
        } catch (error) {
          console.error('Failed to restore authentication state:', error);
          await logout(); // Clear invalid auth state
        }
      }
      
      setIsLoading(false);
    };
    
    initAuth();
  }, [logout, refreshAuthToken]);

  // Login user
  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authResponse = await identityService.login(data);
      handleAuthSuccess(authResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to login';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Register new user
  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const authResponse = await identityService.register(data);
      handleAuthSuccess(authResponse);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to register';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [handleAuthSuccess]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContextCreated.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
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
