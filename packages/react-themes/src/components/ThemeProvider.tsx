/**
 * ThemeProvider component for managing theme state
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeMode, ResolvedTheme, Theme, ThemeConfig } from '../types';
import {
  getStoredThemeMode,
  setStoredThemeMode,
  getSystemPreference,
  watchSystemPreference,
  themeToCSSVariables,
  applyCSSVariables,
  applyTransitionEffect,
} from '../utils';
import { defaultThemes } from '../themes';

interface ThemeProviderProps {
  children: ReactNode;
  config?: ThemeConfig;
}

const DEFAULT_CONFIG: Required<ThemeConfig> = {
  defaultMode: 'system',
  storageKey: 'theme-mode',
  enableTransitions: true,
  transitionDuration: 200,
  themes: {},
  attribute: 'data-theme',
  onThemeChange: () => {},
};

/**
 * ThemeProvider component
 * 
 * Wraps your application to provide theme management functionality
 * 
 * @example
 * ```tsx
 * import { ThemeProvider } from '@asafarim/react-themes';
 * 
 * function App() {
 *   return (
 *     <ThemeProvider config={{ defaultMode: 'dark' }}>
 *       <YourApp />
 *     </ThemeProvider>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children, config = {} }: ThemeProviderProps) {
  const mergedConfig = useMemo(
    () => ({ ...DEFAULT_CONFIG, ...config }),
    [config]
  );
  
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(() =>
    getSystemPreference()
  );
  
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = getStoredThemeMode(mergedConfig.storageKey);
    return stored || mergedConfig.defaultMode;
  });
  
  const [customThemes, setCustomThemes] = useState<Record<string, Theme>>(() => ({
    ...defaultThemes,
    ...mergedConfig.themes,
  }));
  
  const [currentThemeName, setCurrentThemeName] = useState<string | null>(null);
  
  const isInitialMount = useRef(true);
  
  // Calculate resolved theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (mode === 'system') {
      return systemPreference;
    }
    return mode;
  }, [mode, systemPreference]);
  
  // Get current theme object
  const theme: Theme = useMemo(() => {
    if (currentThemeName && customThemes[currentThemeName]) {
      return customThemes[currentThemeName];
    }
    return customThemes[resolvedTheme] || defaultThemes[resolvedTheme];
  }, [resolvedTheme, currentThemeName, customThemes]);
  
  // Set theme mode
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      setStoredThemeMode(mergedConfig.storageKey, newMode);
      setCurrentThemeName(null); // Reset custom theme when mode changes
    },
    [mergedConfig.storageKey]
  );
  
  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const newMode = resolvedTheme === 'light' ? 'dark' : 'light';
    setMode(newMode);
  }, [resolvedTheme, setMode]);
  
  // Register a custom theme
  const registerTheme = useCallback((name: string, newTheme: Theme) => {
    setCustomThemes((prev) => ({
      ...prev,
      [name]: newTheme,
    }));
  }, []);
  
  // Get a theme by name
  const getTheme = useCallback(
    (name: string): Theme | undefined => {
      return customThemes[name];
    },
    [customThemes]
  );
  
  // Get all themes
  const getAllThemes = useCallback(() => {
    return customThemes;
  }, [customThemes]);
  
  // Apply a custom theme
  const applyTheme = useCallback((name: string) => {
    if (customThemes[name]) {
      setCurrentThemeName(name);
    } else {
      console.warn(`Theme "${name}" not found`);
    }
  }, [customThemes]);
  
  // Watch system preference changes
  useEffect(() => {
    const unwatch = watchSystemPreference((preference) => {
      setSystemPreference(preference);
    });
    
    return unwatch;
  }, []);
  
  // Apply theme to DOM
  useEffect(() => {
    // Skip transition on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (mergedConfig.enableTransitions) {
      applyTransitionEffect(mergedConfig.transitionDuration);
    }
    
    // Set attribute on document element
    document.documentElement.setAttribute(
      mergedConfig.attribute,
      resolvedTheme
    );
    
    // Apply CSS variables
    const variables = themeToCSSVariables(theme);
    applyCSSVariables(variables);
    
    // Call onChange callback
    mergedConfig.onThemeChange(resolvedTheme);
  }, [theme, resolvedTheme, mergedConfig]);
  
  const contextValue = useMemo(
    () => ({
      mode,
      resolvedTheme,
      theme,
      setMode,
      toggleTheme,
      registerTheme,
      getTheme,
      getAllThemes,
      applyTheme,
      systemPreference,
    }),
    [
      mode,
      resolvedTheme,
      theme,
      setMode,
      toggleTheme,
      registerTheme,
      getTheme,
      getAllThemes,
      applyTheme,
      systemPreference,
    ]
  );
  
  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}
