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

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedUser = localStorage.getItem("user_info");
      const token = localStorage.getItem("auth_token");

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
          } catch (err) {
            console.warn('Profile fetch failed, will attempt to refresh token but keep session:', err);
            try {
              await refreshAuthToken();
            } catch (refreshErr) {
              console.warn('Token refresh failed; keeping local session to avoid redirect loop:', refreshErr);
              // Intentionally do not logout here to prevent redirect loops
            }
          }
        } catch (error) {
          console.error("Failed to restore authentication state:", error);
          await logout(); // Clear invalid auth state
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback((authResponse: AuthResponse) => {
    const { token, refreshToken, user } = authResponse;

    // Store tokens and user info
    localStorage.setItem("auth_token", token);
    localStorage.setItem("refresh_token", refreshToken);
    localStorage.setItem("user_info", JSON.stringify(user));

    setUser(user);
    setError(null);
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
      console.log('API URL:', import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5001/api');

      try {
        const authResponse = await identityService.register(data);
        console.log('Registration successful:', authResponse);
        handleAuthSuccess(authResponse);
        // Return true to indicate success for UI handling
        return true;
      } catch (error: unknown) {
        console.error('Registration error:', error);
        setError(error instanceof Error ? error.message : "Failed to register");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
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
    setIsLoading(false);
    setError(null);
  }, []);

  // Setup password for user with null password
  const setupPassword = useCallback(
    async (data: { userId: string; password: string }) => {
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

  return (
    <AuthContextCreated.Provider
      value={{
        user,
        isAuthenticated: !!user,
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
