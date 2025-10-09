/**
 * @asafarim/react-themes
 * 
 * A comprehensive theme management system for React applications
 * with automatic dark/light mode detection, persistent user selection,
 * and smooth CSS variable-based transitions.
 */

// Components
export { ThemeProvider, ThemeToggle, ThemeSelect } from './src/components';

// Hooks
export { useTheme } from './src/hooks';

// Types
export type {
  ThemeMode,
  ResolvedTheme,
  Theme,
  ThemeConfig,
  ThemeContextValue,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  ThemeShadows,
  ThemeBorderRadius,
  ThemeTransitions,
  CSSVariable,
} from './src/types';

// Themes
export { lightTheme, darkTheme, defaultThemes } from './src/themes';

// Utilities (for advanced usage)
export {
  themeToCSSVariables,
  applyCSSVariables,
  removeCSSVariables,
  getCSSVariable,
  applyTransitionEffect,
  getStoredThemeMode,
  setStoredThemeMode,
  removeStoredThemeMode,
  getSystemPreference,
  watchSystemPreference,
} from './src/utils';
