/**
 * Simple Theme Preloader for Docusaurus
 */
(function() {
  const COOKIE_NAME = 'asafarim_theme';
  
  // Get theme from cookie
  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  }

  // Apply theme immediately
  function applyTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.style.colorScheme = 'dark';
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      document.documentElement.style.colorScheme = 'light';
    }
  }

  // Get theme from cookie or localStorage
  const cookieTheme = getCookie(COOKIE_NAME);
  const localTheme = localStorage.getItem('theme');
  
  // Use cookie first, then localStorage, default to dark
  const theme = cookieTheme || localTheme || 'dark';
  
  // Apply theme immediately
  applyTheme(theme);
  
  // Set localStorage for Docusaurus
  if (theme === 'light' || theme === 'dark') {
    localStorage.setItem('theme', theme);
  }
})();
