import React from 'react';
import useAuth from '../../hooks/useAuth';
import styles from './styles.module.css';

/**
 * AuthStatus component
 * 
 * Displays the current authentication status and provides
 * a sign-out button if the user is authenticated.
 */
export default function AuthStatus(): React.ReactElement {
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  if (loading) {
    return <div className={styles.authStatus}>Loading authentication status...</div>;
  }

  if (!isAuthenticated) {
    const redirectTo = window.location.href;
    return (
      <div className={styles.authStatus}>
        <span className={styles.statusText}>Not signed in</span>
        <button
          className={styles.signInButton}
          onClick={() => signIn(redirectTo)}
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authStatus}>
      <span className={styles.statusText}>
        Welcome {user?.email || 'User'}!
      </span>
      <button
        className={styles.signOutButton}
        onClick={() => signOut()}
      >
        Sign Out
      </button>
    </div>
  );
}
