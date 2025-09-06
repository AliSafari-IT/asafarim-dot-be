import React from "react";
import CentralSignOut from "./CentralSignOut";
import CentralSignIn from "./CentralSignIn";

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

  const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;

  const t = {
    notSignedIn: labels?.notSignedIn ?? "Not signed in!",
    signIn: labels?.signIn ?? "Sign In",
    signOut: labels?.signOut ?? "Sign Out",
    welcome:
      labels?.welcome ?? ((email?: string) => `Welcome ${email ?? "User"}!`),
  };

  if (loading)
    return (
      <div className={className} style={style}>
        Loading authentication status...
      </div>
    );

  if (!isAuthenticated) {
    return (
      <div className={className + " align-middle"} style={style}>
        <span style={{ marginRight: 8 }}>{t.notSignedIn}</span>
        <CentralSignIn onSignIn={onSignIn}>{isMobile ? "" : t.signIn}</CentralSignIn>
      </div>
    );
  }

  return (
    <div className={className + " align-middle"} style={style}>
      <span style={{ marginRight: 8 }}>{t.welcome(user?.email)}</span>
      <CentralSignOut onSignOut={onSignOut}>
        {isMobile ? "" : t.signOut}
      </CentralSignOut>
    </div>
  );
}
