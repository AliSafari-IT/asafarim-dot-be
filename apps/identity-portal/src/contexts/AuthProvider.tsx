import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { AuthContextCreated } from "./AuthContextCreated";
import identityService, {
  type AuthResponse,
  type UserInfo,
  type PasswordSetupRequest,
} from "../api/identityService";
import type { LoginRequest, RegisterRequest } from "../api/identityService";
import type { PasswordSetupState } from "./authTypes";
import { isProduction } from "@asafarim/shared-ui-react";

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [passwordSetupRequired, setPasswordSetupRequired] =
    useState<PasswordSetupState | null>(null);

  // Environment-aware cookie domain for best-effort non-HttpOnly cleanup
  // const COOKIE_DOMAIN = typeof window !== 'undefined' && (window.location.hostname.endsWith('asafarim.be') || window.location.protocol === 'https:')
  const COOKIE_DOMAIN = isProduction ? ".asafarim.be" : ".asafarim.local";

  // Logout user
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      await identityService.logout();
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear auth state regardless of API response
      // Remove items one by one to ensure storage events are triggered properly
      // This ensures other apps can detect the logout
      localStorage.removeItem("auth_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("user_info");
      document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;
      document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;
      document.cookie = `user_info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;

      // Dispatch a custom event for local listeners
      window.dispatchEvent(new Event("auth-signout"));

      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = useCallback(async (authResponse: AuthResponse) => {
    const { token, refreshToken } = authResponse;
    // Persist but do not rely on these for auth decisions; server cookies are the source of truth
    localStorage.setItem("auth_token", token);
    localStorage.setItem("refresh_token", refreshToken);

    try {
      // Immediately fetch server-validated profile to ensure cookies are in place
      const profile = await identityService.getProfile();
      localStorage.setItem("user_info", JSON.stringify(profile));
      setUser(profile);
      setError(null);
    } catch (e) {
      console.warn("Post-auth profile fetch failed:", e);
      setUser(null);
    }
  }, []);

  // Check if user is already logged in on mount (server-validated)
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user_info");
        const token = localStorage.getItem("auth_token");

        if (storedUser && token) {
          // Validate by fetching profile; only set user after success
          try {
            console.log("Validating token by fetching user profile...");
            const profile = await identityService.getProfile();
            console.log("Token is valid, user profile retrieved:", profile);
            setUser(profile);
          } catch (profileError) {
            console.log(
              "Profile fetch failed, attempting token refresh...",
              profileError
            );

            // Inline token refresh to avoid dependency issues
            const refreshToken = localStorage.getItem("refresh_token");
            if (refreshToken) {
              try {
                const authResponse = await identityService.refreshToken(
                  refreshToken
                );
                const { token, refreshToken: newRefreshToken } = authResponse;
                localStorage.setItem("auth_token", token);
                localStorage.setItem("refresh_token", newRefreshToken);

                // Fetch profile again after successful refresh
                try {
                  const profile = await identityService.getProfile();
                  localStorage.setItem("user_info", JSON.stringify(profile));
                  setUser(profile);
                  setError(null);
                  console.log("Token refresh and profile fetch successful");
                } catch (err) {
                  console.warn("Profile fetch after refresh failed:", err);
                  setUser(null);
                }
              } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                setUser(null);
              }
            } else {
              console.log("No refresh token available");
              setUser(null);
            }
          }
        } else {
          console.log("No stored authentication found");
          setUser(null);
        }
      } catch (err) {
        console.error("Failed during auth initialization:", err);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    void initAuth();
  }, []); // Empty dependency array - only run on mount

  // Login user
  const login = useCallback(
    async (data: LoginRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);
      setPasswordSetupRequired(null);

      try {
        const response = await identityService.login(data);

        // Check if password setup is required
        if (
          "requiresPasswordSetup" in response &&
          response.requiresPasswordSetup
        ) {
          setPasswordSetupRequired({
            userId: response.userId,
            email: response.email,
          });
          return false; // Return false to indicate login not completed
        }

        // Normal login flow - we know it's an AuthResponse at this point
        await handleAuthSuccess(response as AuthResponse);
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to login";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Register new user
  const register = useCallback(
    async (data: RegisterRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await identityService.register(data);
        await handleAuthSuccess(authResponse);
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to register";
        setError(errorMessage);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [handleAuthSuccess]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Update user profile
  const updateUser = useCallback((userData: Partial<UserInfo>) => {
    setUser((prevUser) => (prevUser ? { ...prevUser, ...userData } : null));
  }, []);

  // Reload user profile
  const reloadProfile = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const updatedUser = await identityService.getProfile();
      setUser(updatedUser);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to reload profile";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Force sign out without API call (for cross-app sync)
  const forceSignOut = useCallback(() => {
    // Clear local state
    setUser(null);
    setIsLoading(false);
    setError(null);

    // Clear local storage
    localStorage.removeItem("auth_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user_info");

    // Clear cookies (best-effort for any non-HttpOnly values)
    document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;
    document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;
    document.cookie = `user_info=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; domain=${COOKIE_DOMAIN}`;

    console.log("Force sign out completed");
  }, []);

  // Setup password for user with null password
  const setupPassword = useCallback(
    async (data: PasswordSetupRequest): Promise<boolean> => {
      setIsLoading(true);
      setError(null);

      try {
        const authResponse = await identityService.setupPassword(data);
        await handleAuthSuccess(authResponse);
        setPasswordSetupRequired(null);
        return true;
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to set password";
        setError(errorMessage);
        return false;
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
