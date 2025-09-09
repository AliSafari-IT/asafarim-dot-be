import { useEffect } from 'react';

/**
 * Hook to synchronize theme across different subdomains using cookies
 * 
 * @param options Configuration options
 * @param options.storageKey The localStorage key to use for theme storage (default: 'asafarim-theme')
 * @param options.cookieName The cookie name to use for theme syncing (default: 'asafarim_theme')
 * @param options.defaultTheme The default theme to use if none is found (default: 'dark')
 * @param options.syncInterval How often to check for theme changes in ms (default: 1000)
 */
export function useThemeSync({
  storageKey = 'asafarim-theme',
  cookieName = 'asafarim_theme',
  defaultTheme = 'dark',
  syncInterval = 1000
} = {}) {
  useEffect(() => {
    // Helper to get a cookie by name
    const getCookie = (name: string): string | undefined =>
      document.cookie
        .split(';')
        .map(c => c.trim())
        .find(c => c.startsWith(name + '='))
        ?.split('=')[1];

    // On load: if cookie has a theme, seed localStorage so ThemeProvider picks it up
    const cookieTheme = getCookie(cookieName);
    if (cookieTheme) {
      localStorage.setItem(storageKey, cookieTheme);
    }

    // Track the last known theme value
    let lastTheme = localStorage.getItem(storageKey) || cookieTheme || defaultTheme;

    // Helper to write the theme cookie with proper domain detection
    const writeCookie = (value: string) => {
      // Auto-detect if we're in production or development
      const isProd = window.location.protocol === 'https:' || 
                     window.location.hostname.endsWith('asafarim.be');
      
      // Use the appropriate domain for cookies
      const domain = isProd ? '.asafarim.be' : '.asafarim.local';
      
      // Set the cookie with a long expiration
      document.cookie = `${cookieName}=${value}; domain=${domain}; path=/; max-age=31536000; samesite=lax`;
    };

    // Keep cookie in sync when local theme changes
    const interval = setInterval(() => {
      const currentTheme = localStorage.getItem(storageKey);
      if (currentTheme && currentTheme !== lastTheme) {
        lastTheme = currentTheme;
        writeCookie(currentTheme);
      }
    }, syncInterval);

    // When tab becomes visible, pull latest from cookie (sync across subdomains)
    const onVisibilityChange = () => {
      if (!document.hidden) {
        const cookieValue = getCookie(cookieName);
        if (cookieValue && cookieValue !== localStorage.getItem(storageKey)) {
          localStorage.setItem(storageKey, cookieValue);
        }
      }
    };
    
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Clean up
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [storageKey, cookieName, defaultTheme, syncInterval]);
}

export default useThemeSync;
