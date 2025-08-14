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

/**
 * Checks if the user is currently authenticated
 * @returns boolean indicating if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false; // SSR check
  return !!localStorage.getItem(AUTH_TOKEN_KEY);
};

/**
 * Gets the current user information
 * @returns User info object or null if not authenticated
 */
export const getUserInfo = () => {
  if (typeof window === 'undefined') return null; // SSR check
  
  const userInfoString = localStorage.getItem(USER_INFO_KEY);
  if (!userInfoString) return null;
  
  try {
    return JSON.parse(userInfoString);
  } catch (error) {
    console.error('Failed to parse user info:', error);
    return null;
  }
};

/**
 * Handles sign-out across applications
 * Removes authentication data and optionally redirects
 * @param redirectUrl Optional URL to redirect to after sign-out
 */
export const handleSignOut = (redirectUrl?: string): void => {
  if (typeof window === 'undefined') return; // SSR check
  
  // Clear authentication data
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_INFO_KEY);
  
  // Trigger custom event for other components to react to
  window.dispatchEvent(new Event('auth-signout'));
  
  // Optional redirect
  if (redirectUrl) {
    window.location.href = redirectUrl;
  }
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
  setupAuthSyncListener,
};
