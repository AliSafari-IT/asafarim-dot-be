import React from 'react';
import OriginalNavbar from '@theme-original/Navbar';
import { AuthStatus, useAuth } from '@asafarim/shared-ui-react';

/**
 * Custom Navbar component
 * 
 * Extends the original Docusaurus Navbar to include the AuthStatus component
 * for displaying authentication status and sign-out functionality.
 */
export default function Navbar(props): React.ReactElement {
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  return (
    <>
      <OriginalNavbar {...props} />
      <AuthStatus
        isAuthenticated={isAuthenticated}
        user={user}
        loading={loading}
        onSignIn={(returnUrl) => signIn(returnUrl)}
        onSignOut={() => signOut()}
        labels={{
          notSignedIn: 'Not signed in',
          signIn: 'Sign In',
          signOut: 'Sign Out',
          welcome: (email?: string) => `Welcome ${email ?? 'User'}!`,
        }}
      />
    </>
  );
}
