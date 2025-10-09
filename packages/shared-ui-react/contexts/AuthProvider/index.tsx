import  { createContext } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";

interface AuthProviderProps {
    children: ReactNode;
}
export function AuthProvider({ children }: AuthProviderProps) {
    const { isAuthenticated, user, loading, signOut, signIn } = useAuth();

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = createContext<{
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  signOut: (redirectUrl?: string) => Promise<void>;
  signIn: (redirectUrl?: string) => Promise<void>;
} | null>(null);

// Export AuthProvider directly without React.memo to avoid JSX compatibility issues
export const AuthSyncProvider = AuthProvider;

