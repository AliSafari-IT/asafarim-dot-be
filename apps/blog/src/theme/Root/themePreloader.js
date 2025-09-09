/**
 * Theme Preloader Script for Docusaurus
 * 
 * This script runs before Docusaurus initializes and applies the theme from cookies/localStorage
 * to prevent flash of wrong theme when navigating between apps.
 */
(function() {
  // Constants
  const STORAGE_KEY = 'asafarim-theme';
  const DOCUSAURUS_KEY = 'theme';
  const COOKIE_NAME = 'asafarim_theme';
  
  // Get theme from cookie
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Apply theme to document immediately
  function applyTheme(theme) {
    const root = document.documentElement;
    
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
      root.style.colorScheme = 'dark';
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.setAttribute('data-theme', 'light');
      root.style.colorScheme = 'light';
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }

  // Get theme from cookie or localStorage
  const cookieTheme = getCookie(COOKIE_NAME);
  const localTheme = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(DOCUSAURUS_KEY);
  
  // Determine which theme to use (cookie takes precedence)
  const theme = cookieTheme || localTheme || 'dark';
  
  // Store theme in localStorage for Docusaurus to pick up
  if (cookieTheme) {
    localStorage.setItem(STORAGE_KEY, cookieTheme);
    localStorage.setItem(DOCUSAURUS_KEY, cookieTheme);
  }
  
  // Apply theme immediately
  applyTheme(theme);
})();
