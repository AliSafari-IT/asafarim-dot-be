import React from "react";
import CentralSignOut from "./Auth/CentralSignOut";

export interface AuthStatusProps {
  isAuthenticated: boolean;
  user?: { email?: string } | null;
  loading?: boolean;
  onSignIn?: (redirectUrl?: string) => void;
  onSignOut?: () => void;
  className?: string;
  style?: React.CSSProperties;
  labels?: {
    notSignedIn?: string;
    signIn?: string;
    welcome?: (email?: string) => string;
    signOut?: string;
  };
}

/**
 * Framework-agnostic AuthStatus presentational component.
 * You pass auth state and callbacks; styles can be provided via parent.
 */
export default function AuthStatus(props: AuthStatusProps) {
  const {
    isAuthenticated,
    user,
    loading,
    onSignIn,
    onSignOut,
    className = "authStatusContainer",
    style,
    labels,
  } = props;

  const t = {
    notSignedIn: labels?.notSignedIn ?? "Not signed in!",
    signIn: labels?.signIn ?? "Sign In",
    signOut: labels?.signOut ?? "Sign Out",
    welcome:
      labels?.welcome ?? ((email?: string) => `Welcome ${email ?? "User"}!`),
  };

  const redirectTo =
    typeof window !== "undefined" ? window.location.href : undefined;

  if (loading)
    return (
      <div className={className} style={style}>
        Loading authentication status...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className={className} style={style}>
        <span style={{ marginRight: 8 }}>{t.notSignedIn}</span>
        <button onClick={() => onSignIn?.(redirectTo)}>{t.signIn}</button>
      </div>
    );
  }

  return (
    <div className={className} style={style}>
      <span style={{ marginRight: 8 }}>{t.welcome(user?.email)}</span>
      <CentralSignOut onSignOut={onSignOut}>
        {t.signOut}
      </CentralSignOut>
    </div>
  );
}
