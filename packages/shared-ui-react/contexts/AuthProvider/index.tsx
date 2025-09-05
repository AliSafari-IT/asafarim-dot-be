import React from "react";
import { useAuth } from "../../hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }): React.ReactElement {
    const { isAuthenticated, user, loading, signOut, signIn } = useAuth();

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export const AuthContext = React.createContext<{
  isAuthenticated: boolean;
  user: any | null;
  loading: boolean;
  signOut: (redirectUrl?: string) => Promise<void>;
  signIn: (redirectUrl?: string) => Promise<void>;
} | null>(null);

export const AuthSyncProvider = React.memo(AuthProvider);

