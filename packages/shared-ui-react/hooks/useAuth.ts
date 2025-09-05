import { useState, useEffect, useCallback } from 'react';

export interface UseAuthOptions {
  authApiBase?: string;               // e.g. http://api.asafarim.local:5190
  meEndpoint?: string;                // e.g. /auth/me
  logoutEndpoint?: string;            // e.g. /auth/logout
  identityLoginUrl?: string;          // full URL to identity login page
}

export interface UseAuthResult<TUser = any> {
  isAuthenticated: boolean;
  user: TUser | null;
  loading: boolean;
  signOut: (redirectUrl?: string) => Promise<void>;
  signIn: (redirectUrl?: string) => Promise<void>;
}

async function fetchIsAuthenticated(base: string, me: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}${me}`, { method: 'GET', credentials: 'include' });
    return res.status !== 401;
  } catch {
    return false;
  }
}

async function fetchUserInfo<TUser>(base: string, me: string): Promise<TUser | null> {
  try {
    const res = await fetch(`${base}${me}`, { method: 'GET', credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()) as TUser;
  } catch {
    return null;
  }
}

export function useAuth<TUser = any>(options?: UseAuthOptions): UseAuthResult<TUser> {
  const authApiBase = options?.authApiBase ?? 'http://api.asafarim.local:5190';
  const meEndpoint = options?.meEndpoint ?? '/auth/me';
  const logoutEndpoint = options?.logoutEndpoint ?? '/auth/logout';
  const identityLoginUrl = options?.identityLoginUrl ?? 'http://identity.asafarim.local:5177/login';

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    const checkAuth = async () => {
      const ok = await fetchIsAuthenticated(authApiBase, meEndpoint);
      if (!mounted) return;
      setAuthenticated(ok);
      setUser(ok ? await fetchUserInfo<TUser>(authApiBase, meEndpoint) : null);
      setLoading(false);
    };

    // Initial check
    void checkAuth();
    // Short delayed re-check to catch cookies set right before mount
    const delayId = window.setTimeout(() => { void checkAuth(); }, 1000);

    const handle = () => { void checkAuth(); };
    const onStorage = (evt: StorageEvent) => {
      if (evt.key === 'auth_token' || evt.key === 'user_info') handle();
    };
    window.addEventListener('auth-signout', handle);
    window.addEventListener('focus', handle);
    document.addEventListener('visibilitychange', handle);
    window.addEventListener('storage', onStorage);
    return () => {
      mounted = false;
      window.clearTimeout(delayId);
      window.removeEventListener('auth-signout', handle);
      window.removeEventListener('focus', handle);
      document.removeEventListener('visibilitychange', handle);
      window.removeEventListener('storage', onStorage);
    };
  }, [authApiBase, meEndpoint]);

  const signOut = useCallback(async (redirectUrl?: string) => {
    // Guard: if a click event or non-string sneaks in, use default
    if (redirectUrl && typeof redirectUrl !== 'string') {
      redirectUrl = '/';
    }
    
    try {
      // Clear local storage first
      try {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
      } catch (error) {
        console.warn('Failed to clear local storage:', error);
      }

      // Clear cookies
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.asafarim.local';
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=.asafarim.local';

      // Notify backend
      try {
        await fetch(`${authApiBase}${logoutEndpoint}`, { 
          method: 'POST', 
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            returnUrl: redirectUrl || '/'
          })
        });
      } catch (error) {
        console.warn('Failed to notify backend of logout:', error);
      }

      // Update local state
      setAuthenticated(false);
      setUser(null);
      
      // Notify other tabs/windows
      window.dispatchEvent(new Event('auth-signout'));
      
      // Redirect to home or specified URL
      if (redirectUrl) {
        window.location.href = redirectUrl;
      } else {
        // If no redirect URL specified, reload the current page to reset state
        window.location.reload();
      }
    } catch (error) {
      console.error('Error during sign out:', error);
      // Even if there's an error, try to redirect
      window.location.href = redirectUrl || '/';
    }
  }, [authApiBase, logoutEndpoint]);

  const signIn = useCallback(async (redirectUrl?: string) => {
    const returnUrl = encodeURIComponent(redirectUrl || window.location.href);
    window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`;
  }, [identityLoginUrl]);

  return { isAuthenticated: authenticated, user, loading, signOut, signIn };
}

export default useAuth;


