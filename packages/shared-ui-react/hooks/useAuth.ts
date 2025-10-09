import { useState, useEffect, useCallback } from 'react';
import { isProduction } from '../configs';

export interface UseAuthOptions {
  authApiBase?: string;               // e.g. http://api.asafarim.local:5101
  meEndpoint?: string;                // e.g. /auth/me
  tokenEndpoint?: string;             // e.g. /auth/token
  logoutEndpoint?: string;            // e.g. /auth/logout
  identityLoginUrl?: string;          // full URL to identity login page
  identityRegisterUrl?: string;       // full URL to identity register page
}

export interface UseAuthResult<TUser = any> {
  isAuthenticated: boolean;
  user: TUser | null;
  token: string | null;
  loading: boolean;
  signOut: (redirectUrl?: string) => Promise<void>;
  signIn: (redirectUrl?: string) => Promise<void>;
  refreshTokenIfNeeded: () => Promise<string | null>;
}

async function fetchIsAuthenticated(base: string, me: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}${me}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    return res.status !== 401;
  } catch (error) {
    console.error('Auth check failed:', error);
    return false;
  }
}

async function fetchUserInfo<TUser>(base: string, me: string): Promise<TUser | null> {
  try {
    const res = await fetch(`${base}${me}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    if (!res.ok) {
      console.error('User info fetch failed:', res.status, res.statusText);
      return null;
    }
    return (await res.json()) as TUser;
  } catch (error) {
    console.error('User info fetch error:', error);
    return null;
  }
}

// fetch token
async function fetchToken(base: string, tokenEndpoint: string): Promise<string | null> {
  try {
    const res = await fetch(`${base}${tokenEndpoint}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      console.error('Token fetch failed:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    return data.token; // Extract token from the response
  } catch (error) {
    console.error('Token fetch error:', error);
    return null;
  }
}

// Helper function to check if token is expired
function isTokenExpired(token: string | null): boolean {
  if (!token) return true;

  try {
    // JWT tokens have 3 parts separated by dots
    const parts = token.split('.');
    if (parts.length !== 3) return true;

    // Decode the payload (second part)
    const payload = JSON.parse(atob(parts[1]));

    // Check if token exists and is expired
    const now = Math.floor(Date.now() / 1000);
    const exp = payload.exp;

    // Return true if token is missing, invalid, or expired
    return !exp || exp <= now;
  } catch {
    // If we can't decode the token, consider it expired
    return true;
  }
}

// Refresh token function
async function refreshToken(base: string): Promise<string | null> {
  try {
    const res = await fetch(`${base}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    if (!res.ok) {
      console.error('Token refresh failed:', res.status, res.statusText);
      return null;
    }
    const data = await res.json();
    return data.token;
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export function useAuth<TUser = any>(options?: UseAuthOptions): UseAuthResult<TUser> {
  const isProd = isProduction;
  const defaultAuthBase = isProd
    ? '/api/identity'
    : (import.meta as any).env?.VITE_IDENTITY_API_URL ?? 'http://api.asafarim.local:5102';
  console.log('shared-ui-react/hooks/useAuth.ts: defaultAuthBase: in production? ' + isProd, defaultAuthBase);
  const authApiBase = options?.authApiBase ?? defaultAuthBase;
  console.log('shared-ui-react/hooks/useAuth.ts: authApiBase', authApiBase);
  const meEndpoint = options?.meEndpoint ?? '/auth/me';
  const tokenEndpoint = options?.tokenEndpoint ?? '/auth/token';
  console.log('shared-ui-react/hooks/useAuth.ts: meEndpoint', meEndpoint);
  console.log('shared-ui-react/hooks/useAuth.ts: tokenEndpoint', tokenEndpoint);
  const logoutEndpoint = options?.logoutEndpoint ?? '/auth/logout';
  console.log('shared-ui-react/hooks/useAuth.ts: logoutEndpoint', logoutEndpoint);
  const defaultIdentityLogin = isProd ? 'https://identity.asafarim.be/login' : 'http://identity.asafarim.local:5177/login';
  // const defaultIdentityRegister = isProd ? 'https://identity.asafarim.be/register' : 'http://identity.asafarim.local:5177/register';
  const identityLoginUrl = options?.identityLoginUrl ?? defaultIdentityLogin;
  //const identityRegisterUrl = options?.identityRegisterUrl ?? defaultIdentityRegister;

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(null);

  // Move refreshTokenIfNeeded outside of checkAuth so it can be reused
  const refreshTokenIfNeeded = async (currentToken?: string | null): Promise<string | null> => {
    const tokenToCheck = currentToken || localStorage.getItem('auth_token');
    if (isTokenExpired(tokenToCheck)) {
      console.log('Token expired, refreshing...');
      const newToken = await refreshToken(authApiBase);
      if (newToken) {
        localStorage.setItem('auth_token', newToken);
        setToken(newToken);
        console.log('Token refreshed successfully');
        return newToken;
      } else {
        console.log('Token refresh failed, logging out...');
        // If refresh fails, log out
        setAuthenticated(false);
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        return null;
      }
    }
    return tokenToCheck;
  };

  useEffect(() => {
    let mounted = true;
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    const checkAuth = async () => {
      console.log('🔍 Checking authentication status...');
      console.log('API Base:', authApiBase);
      console.log('Me endpoint:', meEndpoint);

      try {
        const ok = await fetchIsAuthenticated(authApiBase, meEndpoint);
        setAuthenticated(ok);
        setUser(ok ? await fetchUserInfo<TUser>(authApiBase, meEndpoint) : null);

        if (ok) {
          console.log('🔑 User is authenticated, fetching token...');
          const authToken = await fetchToken(authApiBase, tokenEndpoint);
          if (authToken) {
            // Use refreshTokenIfNeeded to ensure we have a valid token
            const validToken = await refreshTokenIfNeeded(authToken);
            if (validToken) {
              setToken(validToken);
              localStorage.setItem('auth_token', validToken);
              console.log('✅ Valid token stored in localStorage');
            } else {
              // Token refresh failed, log out
              setAuthenticated(false);
              setUser(null);
              setToken(null);
              localStorage.removeItem('auth_token');
              console.log('🗑️ Token refresh failed during auth check');
            }
          } else {
            console.log('⚠️ No token received from API');
            setToken(null);
          }
        } else {
          setToken(null);
          localStorage.removeItem('auth_token');
          console.log('🗑️ Cleared authentication state');
        }

        setLoading(false);
      } catch (error) {
        console.error('❌ Auth check error:', error);
        if (!mounted) return;
        setAuthenticated(false);
        setUser(null);
        setToken(null);
        setLoading(false);
      }
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
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      window.removeEventListener('auth-signout', handle);
      window.removeEventListener('focus', handle);
      document.removeEventListener('visibilitychange', handle);
      window.removeEventListener('storage', onStorage);
    };
  }, [authApiBase, meEndpoint, tokenEndpoint]);

  // Separate effect for token refresh interval
  useEffect(() => {
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    if (authenticated) {
      refreshInterval = setInterval(async () => {
        await refreshTokenIfNeeded();
      }, 10 * 60 * 1000); // 10 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [authenticated, authApiBase]);

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
      const cookieDomain = isProd ? '.asafarim.be' : '.asafarim.local';
      document.cookie = `auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${cookieDomain}`;
      document.cookie = `refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; domain=${cookieDomain}`;

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
      setToken(null);

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
  }, [authApiBase, logoutEndpoint, isProd]);

  const signIn = useCallback(async (redirectUrl?: string) => {
    const returnUrl = encodeURIComponent(redirectUrl || window.location.href);
    window.location.href = `${identityLoginUrl}?returnUrl=${returnUrl}`;
  }, [identityLoginUrl]);

  return { isAuthenticated: authenticated, user, token, loading, signOut, signIn, refreshTokenIfNeeded };
}

export default useAuth;


