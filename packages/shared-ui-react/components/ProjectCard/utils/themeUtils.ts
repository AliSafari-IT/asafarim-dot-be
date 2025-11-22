/**
 * ProjectCard Theme Utilities
 * 
 * This file provides utilities for applying themes to ProjectCard components.
 */

export type ProjectCardTheme = 'light' | 'dark' | 'auto';

/**
 * Applies a theme to the document root element
 * @param theme - The theme to apply ('light', 'dark', or 'auto')
 */
export function applyProjectCardTheme(theme: ProjectCardTheme): void {
  const root = document.documentElement;
  
  switch (theme) {
    case 'light':
      root.removeAttribute('data-theme');
      break;
    case 'dark':
      root.setAttribute('data-theme', 'dark');
      break;
    case 'auto':
      // Auto theme based on system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
      break;
  }
}

/**
 * Gets the current theme from the document
 * @returns The current theme ('light' or 'dark')
 */
export function getCurrentProjectCardTheme(): 'light' | 'dark' {
  const root = document.documentElement;
  return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

/**
 * Listens for system theme changes and applies them automatically
 * @param theme - The theme mode ('auto' for system preference, or specific theme)
 */
export function watchProjectCardTheme(theme: ProjectCardTheme): () => void {
  if (theme === 'auto') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      const root = document.documentElement;
      if (e.matches) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Return cleanup function
    return () => mediaQuery.removeEventListener('change', handleChange);
  }
  
  // Return no-op cleanup function for non-auto themes
  return () => {};
}

/**
 * Creates a theme context for React applications
 * @param initialTheme - The initial theme to use
 * @returns An object with theme state and utilities
 */
export function createProjectCardThemeContext(initialTheme: ProjectCardTheme = 'light') {
  let currentTheme = initialTheme;
  let cleanup: (() => void) | null = null;
  
  const setTheme = (theme: ProjectCardTheme) => {
    currentTheme = theme;
    applyProjectCardTheme(theme);
    
    // Clean up previous watcher
    if (cleanup) {
      cleanup();
    }
    
    // Set up new watcher if auto
    if (theme === 'auto') {
      cleanup = watchProjectCardTheme(theme);
    }
  };
  
  const getTheme = () => currentTheme;
  
  const toggleTheme = () => {
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };
  
  // Initialize theme
  applyProjectCardTheme(initialTheme);
  if (initialTheme === 'auto') {
    cleanup = watchProjectCardTheme(initialTheme);
  }
  
  return {
    theme: currentTheme,
    setTheme,
    getTheme,
    toggleTheme,
    cleanup: () => {
      if (cleanup) {
        cleanup();
      }
    }
  };
}

/**
 * CSS Custom Properties for ProjectCard themes
 * These can be used to create custom theme variations
 */
export const PROJECT_CARD_THEME_VARIABLES = {
  light: {
    '--pc-primary': '#0066cc',
    '--pc-bg-primary': '#ffffff',
    '--pc-text-primary': '#1a1a1a',
    '--pc-border-primary': '#e1e5e9',
  },
  dark: {
    '--pc-primary': '#4da6ff',
    '--pc-bg-primary': '#1a1a1a',
    '--pc-text-primary': '#ffffff',
    '--pc-border-primary': '#333',
  }
} as const;

/**
 * Applies custom CSS variables to the document root
 * @param variables - Object containing CSS variable key-value pairs
 */
export function applyCustomProjectCardTheme(variables: Record<string, string>): void {
  const root = document.documentElement;
  
  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Removes custom CSS variables from the document root
 * @param variables - Array of CSS variable names to remove
 */
export function removeCustomProjectCardTheme(variables: string[]): void {
  const root = document.documentElement;
  
  variables.forEach(key => {
    root.style.removeProperty(key);
  });
} 