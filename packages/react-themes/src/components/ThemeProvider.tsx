// packages/react-themes/src/components/ThemeProvider.tsx
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
 * Wraps your application to provide theme management functionality.
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
  // Merge config safely, ensuring default themes are retained
  const mergedConfig = useMemo(() => ({
    ...DEFAULT_CONFIG,
    ...config,
    themes: { ...defaultThemes, ...(config.themes ?? {}) },
  }), [config]);

  const {
    storageKey,
    defaultMode,
    enableTransitions,
    transitionDuration,
    attribute,
    onThemeChange,
  } = mergedConfig;

  // Detect and store system preference
  const [systemPreference, setSystemPreference] = useState<ResolvedTheme>(() =>
    getSystemPreference()
  );

  // Load initial mode from storage or config
  const [mode, setModeState] = useState<ThemeMode>(() => {
    const stored = getStoredThemeMode(storageKey);
    return stored || defaultMode;
  });

  // Merge default + custom themes
  const [customThemes, setCustomThemes] = useState<Record<string, Theme>>(
    () => mergedConfig.themes
  );

  const [currentThemeName, setCurrentThemeName] = useState<string | null>(null);
  const isInitialMount = useRef(true);

  // Compute resolved theme
  const resolvedTheme: ResolvedTheme = useMemo(() => {
    return mode === 'system' ? systemPreference : mode;
  }, [mode, systemPreference]);

  // Determine active theme object
  const theme: Theme = useMemo(() => {
    if (currentThemeName && customThemes[currentThemeName]) {
      return customThemes[currentThemeName];
    }
    return customThemes[resolvedTheme] || defaultThemes[resolvedTheme];
  }, [resolvedTheme, currentThemeName, customThemes]);

  // Update mode
  const setMode = useCallback(
    (newMode: ThemeMode) => {
      setModeState(newMode);
      setStoredThemeMode(storageKey, newMode);
      setCurrentThemeName(null); // reset custom theme when switching modes
    },
    [storageKey]
  );

  // Toggle between light/dark
  const toggleTheme = useCallback(() => {
    const newMode = resolvedTheme === 'light' ? 'dark' : 'light';
    setMode(newMode);
  }, [resolvedTheme, setMode]);

  // Register a custom theme dynamically
  const registerTheme = useCallback((name: string, newTheme: Theme) => {
    setCustomThemes((prev) => ({
      ...prev,
      [name]: newTheme,
    }));
  }, []);

  // Retrieve a theme by name
  const getTheme = useCallback(
    (name: string): Theme | undefined => customThemes[name],
    [customThemes]
  );

  // Retrieve all themes
  const getAllThemes = useCallback(() => customThemes, [customThemes]);

  // Apply (activate) a custom theme by name
  const applyTheme = useCallback(
    (name: string) => {
      if (customThemes[name]) {
        setCurrentThemeName(name);
      } else {
        console.warn(`Theme "${name}" not found`);
      }
    },
    [customThemes]
  );

  // Watch system preference changes
  useEffect(() => {
    const unwatch = watchSystemPreference(setSystemPreference);
    return unwatch;
  }, []);

  // Apply theme to DOM
  useEffect(() => {
    if (typeof document === 'undefined') return; // SSR safety

    // Smooth transitions
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (enableTransitions) {
      applyTransitionEffect(transitionDuration);
    }

    // Apply attribute and CSS vars
    document.documentElement.setAttribute(attribute, resolvedTheme);
    const variables = themeToCSSVariables(theme);

    // Batch DOM updates for smoother rendering
    requestAnimationFrame(() => applyCSSVariables(variables));

    // Notify consumer
    onThemeChange(resolvedTheme);
  }, [theme, resolvedTheme, enableTransitions, transitionDuration, attribute, onThemeChange]);

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
