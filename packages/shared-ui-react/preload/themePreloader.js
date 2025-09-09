/**
 * Theme Preloader Script
 * 
 * This script runs before React initializes and applies the theme from cookies/localStorage
 * to prevent flash of wrong theme when navigating between apps.
 * 
 * Include this script in the <head> of your HTML before any other scripts.
 */
(function() {
  // Constants
  const STORAGE_KEY = 'asafarim-theme';
  const COOKIE_NAME = 'asafarim_theme';
  
  // Get theme from cookie
  function getCookie(name) {
    return document.cookie
      .split(';')
      .map(c => c.trim())
      .find(c => c.startsWith(name + '='))
      ?.split('=')[1];
  }

  // Apply theme to document immediately
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  // Get theme from cookie or localStorage
  const cookieTheme = getCookie(COOKIE_NAME);
  const localTheme = localStorage.getItem(STORAGE_KEY);
  
  // Determine which theme to use (cookie takes precedence)
  const theme = cookieTheme || localTheme || 'dark';
  
  // Store theme in localStorage for React to pick up
  if (cookieTheme && cookieTheme !== localTheme) {
    localStorage.setItem(STORAGE_KEY, cookieTheme);
  }
  
  // Apply theme immediately
  applyTheme(theme);
})();
