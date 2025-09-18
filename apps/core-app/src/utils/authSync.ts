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
const IDENTITY_ORIGIN = isProd ? 'https://identity.asafarim.be' : 'http://identity.asafarim.local:5101';
const COOKIE_DOMAIN = isProd ? '.asafarim.be' : '.asafarim.local';

/**
 * Checks if the user is currently authenticated
 * @returns boolean indicating if the user is authenticated
 */
import { config } from '../config';

export const isAuthenticated = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false; // SSR check
  const check = async () => {
  const res = await fetch(config.authEndpoints.me, {
    method: 'GET',
    credentials: 'include', // send cookies
  });
  console.log("isAuthenticated authSync", res.status);
  if (res.status === 401) {
    return false;
  }
  return true;
  }
  return await check();
};

/**
 * Gets the current user information
 * @returns User info object or null if not authenticated
 */
export const getUserInfo = async () => {
  if (typeof window === 'undefined') return null; // SSR check
  if (!(await isAuthenticated())) return null;
  const res = await fetch(config.authEndpoints.me, {
    method: 'GET',
    credentials: 'include', // send cookies
  });
  if (res.status === 401) {
    return null;
  }
  const userInfo = await res.json();
  return userInfo;
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
  await fetch(config.authEndpoints.logout, {
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
  if (!isBrowser) return; // SSR check
  // Default to identity portal in current environment
  window.location.href = redirectUrl || IDENTITY_ORIGIN;
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
