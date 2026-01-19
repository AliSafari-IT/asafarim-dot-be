import {
  useCallback,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  identityService,
  type AuthResponse,
  type LoginRequest,
  type PasswordSetupRequest,
  type RegisterRequest,
  type UserInfo,
} from "../api/identityService";

import { AuthContextCreated } from "./AuthContextCreated";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordSetupRequired, setPasswordSetupRequired] = useState<{ userId: string; email: string } | null>(null);
  const [forceAuthenticated, setForceAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      console.log('[AuthContext] Initializing auth state...');
      const storedUser = localStorage.getItem("user_info");
      const token = localStorage.getItem("auth_token");
      console.log('[AuthContext] Initial storage check:', { 
        hasStoredUser: !!storedUser, 
        hasToken: !!token 
      });

      if (storedUser && token) {
        try {
          // Parse stored user info
          const userInfo = JSON.parse(storedUser) as UserInfo;
          console.log('[AuthContext] Setting initial user from localStorage:', userInfo.email);
          
          // CRITICAL: Set user AND force authenticated flag synchronously
          // This MUST happen before any async operations to prevent redirect loops
          setUser(userInfo);
          setForceAuthenticated(true);
          setIsLoading(false);
          console.log('[AuthContext] Auth state established synchronously');

          // Background validation - this runs after the component has rendered
          // and won't affect the initial authentication state
          setTimeout(async () => {
            try {
              console.log('[AuthContext] Background validation starting...');
              const profile = await identityService.getProfile();
              console.log('[AuthContext] Profile fetch successful, updating user');
              setUser(profile); // Update with latest user info
            } catch (err) {
              console.warn('Profile fetch failed, will attempt to refresh token but keep session:', err);
              try {
                const refreshed = await refreshAuthToken();
                console.log('[AuthContext] Token refresh attempt result:', refreshed ? 'success' : 'failed');
                // Even if refresh fails, we keep the local session active
              } catch (refreshErr) {
                console.warn('Token refresh failed; keeping local session to avoid redirect loop:', refreshErr);
                // Intentionally do not logout here to prevent redirect loops
              }
            }
          }, 1000); // Small delay to ensure this runs after initial render
        } catch (error) {
          console.error("Failed to restore authentication state:", error);
          setIsLoading(false);
          await logout(); // Clear invalid auth state
        }
      } else {
        console.log('[AuthContext] No stored credentials found');
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((authResponse: AuthResponse) => {
    const { token, refreshToken, user } = authResponse;
    console.log('[AuthContext] Auth success, storing tokens and user info', { email: user.email });

    // Store tokens and user info
    localStorage.setItem("auth_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user_info", JSON.stringify(user));

    setUser(user);
    setForceAuthenticated(true);
    setError(null);
    console.log('[AuthContext] User state updated after successful auth');
  }, []);
  const updateUser = useCallback((next: UserInfo) => {
    setUser(next);
    localStorage.setItem("user_info", JSON.stringify(next));
  }, []);

  const reloadProfile = useCallback(async () => {
    try {
      const profile = await identityService.getProfile();
      updateUser(profile);
    } catch (err) {
      console.warn('Failed to reload profile:', err);
    }
  }, [updateUser]);


  // Refresh authentication token
  const refreshAuthToken = useCallback(async () => {
    const refreshToken = localStorage.getItem("refresh_token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const authResponse = await identityService.refreshToken(refreshToken);
      handleAuthSuccess(authResponse);
      return true;
    } catch (error) {
      console.error("Failed to refresh token:", error);
      await logout();
      return false;
    }
  }, [handleAuthSuccess]);

  // Login user
  const login = useCallback(
    async (data: LoginRequest) => {
      setIsLoading(true);
      setError(null);
      setPasswordSetupRequired(null);

      try {
        const response = await identityService.login(data);
        
        // Check if password setup is required
        if ('requiresPasswordSetup' in response && response.requiresPasswordSetup) {
          setPasswordSetupRequired({
            userId: response.userId,
            email: response.email
          });
          return false; // Return false to indicate login not completed
        }
        
        // Normal login flow - we know it's an AuthResponse at this point
        handleAuthSuccess(response as AuthResponse);
        return true; // Return true to indicate success for UI handling
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to login");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Register new user
  const register = useCallback(
    async (data: RegisterRequest) => {
      setIsLoading(true);
      setError(null);
      
      console.log('Registering user with data:', { ...data, password: '***' });

      try {
        const registerResponse = await identityService.register(data);
        console.log('Registration successful:', registerResponse);
        
        // Registration returns RegisterResponse, not AuthResponse
        // User needs to confirm email or complete password setup
        // Return true to indicate registration was successful (but not logged in yet)
        return true;
      } catch (error: unknown) {
        console.error('Registration error:', error);
        setError(error instanceof Error ? error.message : "Failed to register");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Logout user
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await identityService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear auth state regardless of API response
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
      setUser(null);
      setForceAuthenticated(false);
      setIsLoading(false);
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Force sign out without calling API (used for cross-app sync events)
  const forceSignOut = useCallback(() => {
    try {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
    } catch (e) {
      console.warn('forceSignOut localStorage cleanup failed', e);
    }
    setUser(null);
    setForceAuthenticated(false);
    setIsLoading(false);
    setError(null);
  }, []);

  // Setup password for user with null password
  const setupPassword = useCallback(
    async (data: PasswordSetupRequest) => {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await identityService.setupPassword(data);
        handleAuthSuccess(authResponse);
        setPasswordSetupRequired(null);
        return true;
      } catch (error: unknown) {
        setError(error instanceof Error ? error.message : "Failed to set password");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Cancel password setup
  const cancelPasswordSetup = useCallback(() => {
    setPasswordSetupRequired(null);
    setError(null);
  }, []);

  // CRITICAL: Consider authenticated if either user object exists OR auth token exists OR forceAuthenticated flag is set
  // This prevents false negatives during page refresh or initial load
  const authToken = localStorage.getItem("auth_token");
  const hasToken = !!authToken;
  const isAuthenticated = !!user || hasToken || forceAuthenticated;
  
  console.log('[AuthContext] Provider render - Auth state:', {
    hasUser: !!user,
    hasToken,
    tokenValue: authToken ? authToken.substring(0, 10) + '...' : 'null',
    forceAuthenticated,
    isAuthenticated,
    isLoading,
    allLocalStorageKeys: Object.keys(localStorage)
  });
  
  return (
    <AuthContextCreated.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        passwordSetupRequired,
        login,
        register,
        setupPassword,
        cancelPasswordSetup,
        logout,
        clearError,
        updateUser,
        reloadProfile,
        forceSignOut,
      }}
    >
      {children}
    </AuthContextCreated.Provider>
  );
};

export default AuthProvider;
