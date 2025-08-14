import { useState, useEffect, useCallback } from 'react';
import { isAuthenticated, getUserInfo, handleSignOut } from '../utils/authSync';

/**
 * Custom hook for authentication in the blog app
 * 
 * This hook provides authentication state and methods for the blog app
 * and synchronizes with other apps in the ASafariM ecosystem.
 */
export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize auth state
  useEffect(() => {
    const checkAuth = async () => {
      const authStatus = await isAuthenticated();
      setAuthenticated(authStatus);
      setUser(authStatus ? await getUserInfo() : null);
      setLoading(false);
    };

    // Check auth status initially
    checkAuth();

    // Set up listener for auth changes
    const handleAuthChange = () => {
      checkAuth();
    };

    // Listen for storage events (for cross-tab/window sync)
    window.addEventListener('storage', (event) => {
      if (event.key === 'auth_token' || event.key === 'user_info') {
        handleAuthChange();
      }
    });

    // Listen for custom auth-signout event
    window.addEventListener('auth-signout', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleAuthChange);
      window.removeEventListener('auth-signout', handleAuthChange);
    };
  }, []);

  // Sign out function
  const signOut = useCallback(async (redirectUrl?: string) => {
    await handleSignOut(redirectUrl);
    setAuthenticated(false);
    setUser(null);
  }, []);

  const signIn = useCallback(async (redirectUrl?: string) => {
    const returnUrl = encodeURIComponent(redirectUrl || window.location.href);
    window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${returnUrl}`;
  }, []);

  return {
    isAuthenticated: authenticated,
    user,
    loading,
    signOut,
    signIn,
  };
}

export default useAuth;
