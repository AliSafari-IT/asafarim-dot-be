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
  // Block during logout
  if (localStorage.getItem('logout_in_progress') === 'true') {
    console.log('🛑 fetchIsAuthenticated blocked - logout in progress');
    return false;
  }
  
  try {
    console.log(`🔍 fetchIsAuthenticated: ${base}${me}`);
    const res = await fetch(`${base}${me}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    console.log(`🔍 fetchIsAuthenticated response: ${res.status}`);
    return res.status !== 401;
  } catch (error) {
    console.error('❌ fetchIsAuthenticated failed:', error);
    return false;
  }
}

async function fetchUserInfo<TUser>(base: string, me: string): Promise<TUser | null> {
  // Block during logout
  if (localStorage.getItem('logout_in_progress') === 'true') {
    console.log('🛑 fetchUserInfo blocked - logout in progress');
    return null;
  }
  
  try {
    console.log(`👤 fetchUserInfo: ${base}${me}`);
    const res = await fetch(`${base}${me}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    console.log(`👤 fetchUserInfo response: ${res.status}`);
    if (!res.ok) {
      console.error('❌ User info fetch failed:', res.status, res.statusText);
      return null;
    }
    const userData = (await res.json()) as TUser;
    console.log('👤 User data received:', userData);
    return userData;
  } catch (error) {
    console.error('❌ User info fetch error:', error);
    return null;
  }
}

// fetch token
async function fetchToken(base: string, tokenEndpoint: string): Promise<string | null> {
  // Block during logout
  if (localStorage.getItem('logout_in_progress') === 'true') {
    console.log('🛑 fetchToken blocked - logout in progress');
    return null;
  }
  
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
  // CRITICAL: Block all refresh attempts if logout is in progress
  if (localStorage.getItem('logout_in_progress') === 'true') {
    console.log('🛑 refreshToken() blocked - logout in progress');
    return null;
  }
  
  try {
    const res = await fetch(`${base}/refresh`, {
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
  
  // IMPORTANT: All authentication operations should use Identity API
  // according to SSO-ARCHITECTURE.md
  // The Identity API controller is at /auth (not /api/identity)
  const defaultIdentityApiBase = isProd
    ? 'https://identity.asafarim.be/auth'
    : `${(import.meta.env as any)?.VITE_IDENTITY_API_URL || 'http://identity.asafarim.local:5101'}/auth`;
  
  console.log('🔐 shared-ui-react/hooks/useAuth.ts: isProd?', isProd);
  console.log('🔐 Identity API Base:', defaultIdentityApiBase);
  
  const authApiBase = options?.authApiBase ?? defaultIdentityApiBase;
  console.log('🔐 Using Auth API Base:', authApiBase);
  
  const meEndpoint = options?.meEndpoint ?? '/me';
  const tokenEndpoint = options?.tokenEndpoint ?? '/token';
  const logoutEndpoint = options?.logoutEndpoint ?? '/logout';
  
  console.log('🔐 Auth endpoints:', { meEndpoint, tokenEndpoint, logoutEndpoint });

  // For logout, ensure we use the Identity API
  const identityLogoutUrl = `${authApiBase}${logoutEndpoint}`;
  
  const defaultIdentityLogin = isProd ? 'https://identity.asafarim.be/login' : 'http://identity.asafarim.local:5177/login';
  const identityLoginUrl = options?.identityLoginUrl ?? defaultIdentityLogin;

  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<TUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // CRITICAL: Start as true to show loading during initial auth check
  const [token, setToken] = useState<string | null>(null);
  
  console.log('🔄 useAuth hook initialized - loading:', true, 'authenticated:', false);

  // Move refreshTokenIfNeeded outside of checkAuth so it can be reused
  const refreshTokenIfNeeded = useCallback(async (currentToken?: string | null): Promise<string | null> => {
    // CRITICAL: Never refresh token if logout is in progress
    if (localStorage.getItem('logout_in_progress') === 'true') {
      console.log('🛑 Token refresh blocked - logout in progress');
      return null;
    }
    
    const tokenToCheck = currentToken || localStorage.getItem('auth_token');
    if (isTokenExpired(tokenToCheck)) {
      console.log('Token expired, refreshing...');
      try {
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
      } catch (error) {
        console.error('Token refresh error:', error);
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
  }, [authApiBase]);

  useEffect(() => {
    let mounted = true;
    let authCheckInProgress = false; // Prevent multiple simultaneous auth checks

    const checkAuth = async () => {
      // Check if logout is in progress - don't try to re-authenticate
      const logoutInProgress = localStorage.getItem('logout_in_progress') === 'true';
      if (logoutInProgress) {
        console.log('🛑 Logout in progress, skipping auth check');
        // Ensure all auth data is cleared
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_info');
        // DON'T remove the logout_in_progress flag here - let it persist until after redirect
        // This prevents multiple auth checks from re-authenticating
        if (mounted) {
          setAuthenticated(false);
          setUser(null);
          setToken(null);
          setLoading(false);
        }
        return;
      }

      // Prevent multiple simultaneous auth checks
      if (authCheckInProgress) {
        console.log('Auth check already in progress, skipping...');
        return;
      }

      authCheckInProgress = true;
      console.log('🔍 Checking authentication status...');
      console.log('API Base:', authApiBase);
      console.log('Me endpoint:', meEndpoint);

      try {
        // First check if we have user info in localStorage as fallback
        const storedUserInfo = localStorage.getItem('user_info');
        let fallbackUserInfo = null;
        
        if (storedUserInfo) {
          try {
            fallbackUserInfo = JSON.parse(storedUserInfo);
            console.log('📝 Found user info in localStorage (fallback):', fallbackUserInfo);
          } catch (e) {
            console.warn('⚠️ Failed to parse stored user info:', e);
          }
        }
        
        // CRITICAL FIX: Add delay to allow cross-domain cookies to be sent on first load
        // When navigating between subdomains, the browser needs time to include cookies in requests
        // 1000ms is needed for reliable cross-subdomain cookie transmission in development
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Now check with the server
        let ok = await fetchIsAuthenticated(authApiBase, meEndpoint);
        
        // RETRY LOGIC: If first check fails and we have stored user info, retry once more
        // This handles the case where cookies weren't sent on first request
        if (!ok && fallbackUserInfo) {
          console.log('⚠️ First auth check failed but user info in localStorage, retrying...');
          await new Promise(resolve => setTimeout(resolve, 300));
          ok = await fetchIsAuthenticated(authApiBase, meEndpoint);
        }

        if (ok) {
          console.log('✅ User is authenticated via server');
          const userData = await fetchUserInfo<TUser>(authApiBase, meEndpoint);
          if (mounted) {
            setAuthenticated(true);
            setUser(userData);
            // Also store user info in localStorage as fallback
            try {
              localStorage.setItem('user_info', JSON.stringify(userData));
            } catch (e) {
              console.warn('⚠️ Failed to store user info in localStorage:', e);
            }
          }

          console.log('🔑 Fetching token for authenticated user...');
          const authToken = await fetchToken(authApiBase, tokenEndpoint);
          if (authToken) {
            // Use refreshTokenIfNeeded to ensure we have a valid token
            const validToken = await refreshTokenIfNeeded(authToken);
            if (validToken && mounted) {
              setToken(validToken);
              localStorage.setItem('auth_token', validToken);
              console.log('✅ Valid token stored in localStorage');
            } else if (mounted) {
              // Token refresh failed, log out
              console.warn('⚠️ Token refresh failed during auth check');
              setAuthenticated(false);
              setUser(null);
              setToken(null);
              localStorage.removeItem('auth_token');
            }
          } else {
            console.log('⚠️ No token received from API');
            if (mounted) {
              setToken(null);
            }
          }
        } else if (fallbackUserInfo) {
          // If server says not authenticated, but we have fallback user info,
          // try one token refresh before giving up
          console.log('🔄 Server says not authenticated but found local user info, attempting token refresh');
          const newToken = await refreshToken(authApiBase);
          
          if (newToken) {
            console.log('✅ Token refreshed, setting user from fallback info');
            if (mounted) {
              setToken(newToken);
              setAuthenticated(true);
              setUser(fallbackUserInfo as TUser);
              localStorage.setItem('auth_token', newToken);
            }
          } else {
            console.log('❌ Token refresh failed, user not authenticated');
            if (mounted) {
              setAuthenticated(false);
              setUser(null);
              setToken(null);
            }
          }
        } else {
          console.log('❌ User is not authenticated');
          if (mounted) {
            setAuthenticated(false);
            setUser(null);
            setToken(null);
            // Don't clear localStorage or cookies here - only signOut should do that
            // This prevents clearing auth data right after a successful login
          }
        }

        if (mounted) {
          console.log('✅ Auth check complete - setting loading=false, authenticated:', authenticated);
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Auth check error:', error);
        if (mounted) {
          setAuthenticated(false);
          setUser(null);
          setToken(null);
          console.log('❌ Auth check failed - setting loading=false');
          setLoading(false);
        }
      } finally {
        authCheckInProgress = false;
      }
    };

    // Initial check only - don't set up listeners that cause loops
    void checkAuth();
    
    // CRITICAL: Cleanup logout flag AFTER initial auth check completes and page stabilizes
    // This runs AFTER checkAuth finishes
    const cleanupTimer = setTimeout(() => {
      if (!mounted) return;
      
      // Clear logout flag if we're on a page after redirect (check URL for _logout param)
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('_logout')) {
        console.log('🧹 Clearing logout flag after redirect (delayed)');
        localStorage.removeItem('logout_in_progress');
        localStorage.removeItem('logout_timestamp');
        // Remove the _logout param from URL without reloading
        urlParams.delete('_logout');
        const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}${window.location.hash}`;
        window.history.replaceState({}, '', newUrl);
      }
      
      // Safety: Clear logout flag if it's been stuck for more than 10 seconds
      const logoutTimestamp = localStorage.getItem('logout_timestamp');
      if (logoutTimestamp) {
        const elapsed = Date.now() - parseInt(logoutTimestamp, 10);
        if (elapsed > 10000) { // 10 seconds
          console.log('🧹 Clearing stuck logout flag (timeout)');
          localStorage.removeItem('logout_in_progress');
          localStorage.removeItem('logout_timestamp');
        }
      }
    }, 2000); // Wait 2 seconds after mount to ensure auth check is done
    
    return () => {
      mounted = false;
      clearTimeout(cleanupTimer);
    };
  }, [authApiBase, meEndpoint, tokenEndpoint, refreshTokenIfNeeded]);

  // Separate effect for token refresh interval - only when authenticated and not loading
  useEffect(() => {
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    // CRITICAL: Don't start auto-refresh if logout is in progress
    const logoutInProgress = localStorage.getItem('logout_in_progress') === 'true';
    
    if (authenticated && !loading && !logoutInProgress) {
      // Refresh token every 45 minutes (with 60-minute token lifetime, gives 15-minute buffer)
      refreshInterval = setInterval(async () => {
        // Double-check logout isn't in progress before refreshing
        if (localStorage.getItem('logout_in_progress') === 'true') {
          console.log('🛑 Skipping token refresh - logout in progress');
          return;
        }
        
        console.log('🔄 Auto-refreshing token (periodic check)...');
        try {
          await refreshTokenIfNeeded();
        } catch (error) {
          console.error('Token refresh interval error:', error);
        }
      }, 45 * 60 * 1000); // 45 minutes
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [authenticated, loading, refreshTokenIfNeeded]);

  const signOut = useCallback(async (redirectUrl?: string) => {
    // CRITICAL: Check if logout is already in progress to prevent multiple calls
    if (localStorage.getItem('logout_in_progress') === 'true') {
      console.log('🛑 Logout already in progress, skipping duplicate call');
      return;
    }

    console.log('🔑 Signing out user');

    // CRITICAL: Set flag FIRST before any async operations
    // This prevents any pending token refresh from executing
    localStorage.setItem('logout_in_progress', 'true');
    localStorage.setItem('logout_timestamp', Date.now().toString());

    // Clear local state IMMEDIATELY
    setAuthenticated(false);
    setUser(null);
    setToken(null);
    setLoading(true); // Set loading to prevent auth checks

    // Clear localStorage auth data (but keep logout_in_progress flag)
    try {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_info');
      console.log('🗑️ Cleared localStorage authentication data');
    } catch (error) {
      console.warn('⚠️ Failed to clear local storage:', error);
    }

    // Skip frontend cookie clearing - HttpOnly cookies can't be cleared by JavaScript
    // Let the backend handle all cookie clearing to avoid interference
    console.log('⏭️ Skipping frontend cookie clearing - backend will handle this');

    // NOTIFY BACKEND TO CLEAR COOKIES - THIS MUST COMPLETE BEFORE REDIRECT
    try {
      console.log('📣 Notifying backend about logout');
      const response = await fetch(identityLogoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      if (response.ok) {
        console.log('✅ Backend logout successful');
        console.log('✅ Cookies cleared by server');
        
        // Trust that backend cleared cookies properly
        // Note: HttpOnly cookies won't show in document.cookie anyway
        console.log('✅ Backend logout completed - cookies should be cleared');
      } else {
        console.warn('⚠️ Backend logout failed:', response.status);
      }
    } catch (error) {
      console.error('❌ Backend logout error:', error);
    }

    // DEV-ONLY SAFEGUARD: Also attempt logout via identity subdomain to clear any host-only cookies
    // that might exist on identity.asafarim.local (cannot be cleared by responses from api.asafarim.local)
    if (!isProd) {
      try {
        // Derive an alternate logout URL on identity subdomain (keep the same port if present)
        let altLogoutUrl: string | null = null;
        try {
          const u = new URL(identityLogoutUrl);
          if (u.hostname.startsWith('api.')) {
            u.hostname = u.hostname.replace('api.', 'identity.');
          } else if (!u.hostname.startsWith('identity.')) {
            u.hostname = `identity.${u.hostname}`;
          }
          altLogoutUrl = u.toString();
        } catch {
          altLogoutUrl = 'http://identity.asafarim.local:5101/auth/logout';
        }

        if (altLogoutUrl && altLogoutUrl !== identityLogoutUrl) {
          console.log('📣 Dev safeguard: notifying identity host logout as well:', altLogoutUrl);
          await fetch(altLogoutUrl, {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
        }
      } catch (e) {
        console.warn('⚠️ Dev safeguard logout (identity host) failed:', e);
      }
    }

    // DON'T call /clear-cookies endpoint - it's redundant and can cause cookie re-sending
    // The logout endpoint already clears cookies properly
    
    // Skip verification step - it can interfere with cookie clearing
    // The backend logout already handles token revocation properly
    console.log('⏭️ Skipping refresh verification to avoid cookie interference');
    
    // Wait to ensure cookies are fully cleared and processed by browser
    console.log('⏱️ Waiting for browser to process logout...');
    await new Promise(resolve => setTimeout(resolve, 1500)); // Increased wait time

    // Verify cookie state after logout (visible cookies only - HttpOnly cookies won't show)
    const remainingCookies = document.cookie;
    console.log('🍪 Remaining visible cookies after logout:', remainingCookies || '(none)');
    if (remainingCookies.includes('atk') || remainingCookies.includes('rtk')) {
      console.warn('⚠️ WARNING: Auth cookies still visible (but HttpOnly cookies won\'t show here)');
    }

    // BROADCAST SIGNOUT EVENT
    window.dispatchEvent(new Event('auth-signout'));

    // FORCE REDIRECT ONLY AFTER LOGOUT COMPLETES
    // Use window.location.replace() instead of .href to ensure browser processes Set-Cookie headers
    console.log('🔄 Redirecting after successful logout...');
    
    // CRITICAL: Default to identity login page, not homepage
    // Homepage might trigger auth checks before flag is cleared
    const targetUrl = redirectUrl || identityLoginUrl;
    
    // Add a timestamp to prevent caching
    const separator = targetUrl.includes('?') ? '&' : '?';
    const finalUrl = `${targetUrl}${separator}_logout=${Date.now()}`;
    
    console.log('🔄 Final redirect URL:', finalUrl);
    window.location.replace(finalUrl);
  }, [authApiBase, identityLogoutUrl, identityLoginUrl, isProd]);


  const signIn = useCallback(async (redirectUrl?: string) => {
    // Use provided redirect URL or current page, but ensure it's a valid URL
    const currentUrl = redirectUrl || window.location.href;

    // Validate and sanitize the return URL to prevent infinite loops
    let returnUrl = currentUrl;
    try {
      const url = new URL(currentUrl, window.location.origin);

      // Prevent infinite loops by ensuring return URL is not the identity login page
      if (url.hostname.includes('identity.') && url.pathname.includes('/login')) {
        console.warn('Preventing redirect to identity login page to avoid infinite loop');
        returnUrl = `${url.protocol}//${url.hostname}`;
      }

      // For AI app, ensure we don't redirect back to a page that immediately requires auth
      if (url.hostname.includes('ai.') && url.pathname === '/chat') {
        // Redirect to home page instead of chat to avoid immediate auth requirement
        returnUrl = `${url.protocol}//${url.hostname}`;
      }

      // Check if we're already on the login page to prevent loops
      if (url.hostname.includes('identity.') && url.pathname === '/login') {
        console.warn('Already on login page, preventing redirect loop');
        return;
      }
    } catch (error) {
      console.error('Invalid return URL:', error);
      returnUrl = window.location.origin;
    }

    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const loginUrl = `${identityLoginUrl}?returnUrl=${encodedReturnUrl}`;

    console.log('Redirecting to login:', loginUrl);
    console.log('Return URL:', returnUrl);

    window.location.href = loginUrl;
  }, [identityLoginUrl]);

  return { isAuthenticated: authenticated, user, token, loading, signOut, signIn, refreshTokenIfNeeded };
}

export default useAuth;


