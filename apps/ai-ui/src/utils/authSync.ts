/**
 * Authentication Synchronization Utility
 * 
 * This utility helps synchronize authentication state across multiple applications
 * by listening to localStorage changes and handling sign-out events.
 */

// Key constants for authentication storage
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_INFO_KEY = 'user_info';

// Environment awareness
const isBrowser = typeof window !== 'undefined';
const hostname = isBrowser ? window.location.hostname : '';
const isProd = isBrowser && (
  hostname.endsWith('asafarim.be') || window.location.protocol === 'https:'
);

// Identity API base (reverse-proxied via Nginx in prod)
const IDENTITY_API_BASE = isProd
  ? '/api/identity'
  : (import.meta as any).env?.VITE_IDENTITY_API_URL || 'http://api.asafarim.local:5177';

// Identity site origin for cross-app actions (e.g., sync-logout)
const IDENTITY_ORIGIN = isProd ? 'https://identity.asafarim.be' : 'http://identity.asafarim.local:5177';

// Cookie domain
const COOKIE_DOMAIN = isProd ? '.asafarim.be' : '.asafarim.local';

/**
 * Checks if the user is currently authenticated
 * @returns boolean indicating if the user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  if (!isBrowser) return false; // SSR check
  const res = await fetch(`${IDENTITY_API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  console.log('isAuthenticated authSync', res.status);
  return res.status !== 401;
};

/**
 * Gets the current user information
 * @returns User info object or null if not authenticated
 */
export const getUserInfo = async () => {
  if (!isBrowser) return null; // SSR check
  if (!(await isAuthenticated())) return null;
  const res = await fetch(`${IDENTITY_API_BASE}/auth/me`, {
    method: 'GET',
    credentials: 'include',
  });
  if (res.status === 401) return null;
  return await res.json();
};

/**
 * Handles sign-out across applications
 * Removes authentication data and optionally redirects
 * @param redirectUrl Optional URL to redirect to after sign-out
 */
export const handleSignOut = async (redirectUrl?: string): Promise<void> => {
  if (typeof window === 'undefined') return; // SSR check
  
  // Clear authentication data from local storage and cookies
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  document.cookie = `auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`;
  document.cookie = `refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`;
  document.cookie = `user_info=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${COOKIE_DOMAIN}`;

  // Best-effort: also clear identity portal storage via hidden iframe (cross-subdomain)
  // This prevents the identity app from thinking the user is still signed in when navigating there next.
  const syncLogout = async () => new Promise<void>((resolve) => {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = `${IDENTITY_ORIGIN}/sync-logout`;
      const cleanup = () => {
        try { iframe.remove(); } catch {
            console.log("cleanup iframe", iframe);
        }
        resolve();
      };
      iframe.onload = cleanup;
      document.body.appendChild(iframe);
      // Fallback in case onload doesn't fire
      setTimeout(cleanup, 1500);
    } catch {
      resolve();
    }
  });
  await syncLogout();

  // call logout endpoint
  await fetch(`${IDENTITY_API_BASE}/auth/logout`, {
    method: 'POST',
    credentials: 'include', // send cookies
  });

  // Trigger custom event for other components to react to
  window.dispatchEvent(new Event('auth-signout'));
  
  // Optional redirect
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
};

export const handleSignIn = async (redirectUrl?: string): Promise<void> => {
  if (typeof window === 'undefined') return; // SSR check
  window.location.href = redirectUrl || 'http://web.asafarim.local:5175';
};

/**
 * Sets up a listener for authentication changes across tabs/windows
 * @param onSignOut Callback function to execute when sign-out is detected
 * @returns Cleanup function to remove the listener
 */
export const setupAuthSyncListener = (onSignOut: () => void): () => void => {
  if (typeof window === 'undefined') return () => {}; // SSR check
  
  // Function to handle storage changes
  const handleStorageChange = (event: StorageEvent) => {
    // Check if auth token was removed
    if (event.key === AUTH_TOKEN_KEY && !event.newValue) {
      onSignOut();
    }
  };
  
  // Function to handle custom sign-out event
  const handleSignOutEvent = () => {
    onSignOut();
  };
  
  // Add event listeners
  window.addEventListener('storage', handleStorageChange);
  window.addEventListener('auth-signout', handleSignOutEvent);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
    window.removeEventListener('auth-signout', handleSignOutEvent);
  };
};

export default {
  isAuthenticated,
  getUserInfo,
  handleSignOut,
  handleSignIn,
  setupAuthSyncListener,
};
