import { createContext, useContext, ReactNode } from "react";
import { useAuth as useSharedAuth } from "@asafarim/shared-ui-react";

interface User {
  id: string;
  email: string;
  userName?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  roles?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (
    email: string,
    password: string,
    confirmPassword: string,
    firstName?: string,
    lastName?: string
  ) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the shared auth hook from @asafarim/shared-ui-react
  // This handles cookie-based SSO with Identity.Api
  const sharedAuth = useSharedAuth();

  // Map shared auth to our local interface
  const user: User | null = sharedAuth.user
    ? {
        id: sharedAuth.user.id || "",
        email: sharedAuth.user.email || "",
        userName: sharedAuth.user.userName,
        roles: sharedAuth.user.roles,
      }
    : null;

  const login = async (_email: string, _password: string) => {
    console.log("🔐 Logging in...");
    // Redirect to Identity Portal login page
    // The shared auth hook will handle the authentication
    const returnUrl = window.location.href;
    sharedAuth.signIn(returnUrl);
  };

  const register = async (
    _email: string,
    _password: string,
    _confirmPassword: string,
    _firstName?: string,
    _lastName?: string
  ) => {
    console.log("📝 Registering...");
    // Redirect to Identity Portal register page
    const registerUrl =
      window.location.href
        .replace("/login", "")
        .replace("freelance-toolkit", "identity") + "/register";
    window.location.href = registerUrl;
  };

  const logout = async () => {
    console.log("🔑 Logging out...");
    await sharedAuth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token: sharedAuth.token,
        login,
        logout,
        register,
        isAuthenticated: sharedAuth.isAuthenticated,
        isLoading: sharedAuth.loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
