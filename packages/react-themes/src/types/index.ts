/**
 * Core theme types for the theme management system
 */

/**
 * Theme mode options
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolved theme (actual theme being displayed)
 */
export type ResolvedTheme = 'light' | 'dark';

/**
 * CSS variable definition
 */
export interface CSSVariable {
  name: string;
  value: string;
}

/**
 * Theme color palette
 */
export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryHover: string;
  primaryActive: string;
  
  // Secondary colors
  secondary: string;
  secondaryHover: string;
  secondaryActive: string;
  
  // Background colors
  background: string;
  backgroundSecondary: string;
  backgroundTertiary: string;
  
  // Surface colors
  surface: string;
  surfaceHover: string;
  surfaceActive: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderHover: string;
  borderFocus: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;
  
  // Additional colors
  accent: string;
  muted: string;
  
  [key: string]: string; // Allow custom color properties
}

/**
 * Theme spacing scale
 */
export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  '3xl': string;
  [key: string]: string; // Allow custom spacing properties
}

/**
 * Theme typography
 */
export interface ThemeTypography {
  fontFamily: string;
  fontFamilyMono: string;
  
  // Font sizes
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
    '4xl': string;
    [key: string]: string;
  };
  
  // Font weights
  fontWeight: {
    light: string;
    normal: string;
    medium: string;
    semibold: string;
    bold: string;
    [key: string]: string;
  };
  
  // Line heights
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
    loose: string;
    [key: string]: string;
  };
}

/**
 * Theme shadows
 */
export interface ThemeShadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  inner: string;
  none: string;
  [key: string]: string;
}

/**
 * Theme border radius
 */
export interface ThemeBorderRadius {
  none: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  '2xl': string;
  full: string;
  [key: string]: string;
}

/**
 * Theme transitions
 */
export interface ThemeTransitions {
  fast: string;
  normal: string;
  slow: string;
  [key: string]: string;
}

/**
 * Complete theme definition
 */
export interface Theme {
  name: string;
  mode: ResolvedTheme;
  colors: ThemeColors;
  spacing?: ThemeSpacing;
  typography?: ThemeTypography;
  shadows?: ThemeShadows;
  borderRadius?: ThemeBorderRadius;
  transitions?: ThemeTransitions;
  custom?: Record<string, any>; // Allow custom theme properties
}

/**
 * Theme configuration options
 */
export interface ThemeConfig {
  /**
   * Default theme mode
   * @default 'system'
   */
  defaultMode?: ThemeMode;
  
  /**
   * Storage key for persisting theme preference
   * @default 'theme-mode'
   */
  storageKey?: string;
  
  /**
   * Enable smooth transitions between themes
   * @default true
   */
  enableTransitions?: boolean;
  
  /**
   * Transition duration in milliseconds
   * @default 200
   */
  transitionDuration?: number;
  
  /**
   * Custom themes to register
   */
  themes?: Record<string, Theme>;
  
  /**
   * Attribute to set on document element
   * @default 'data-theme'
   */
  attribute?: string;
  
  /**
   * Callback when theme changes
   */
  onThemeChange?: (theme: ResolvedTheme) => void;
}

/**
 * Theme context value
 */
export interface ThemeContextValue {
  /**
   * Current theme mode (light, dark, or system)
   */
  mode: ThemeMode;
  
  /**
   * Resolved theme (actual theme being displayed)
   */
  resolvedTheme: ResolvedTheme;
  
  /**
   * Current theme object
   */
  theme: Theme;
  
  /**
   * Set theme mode
   */
  setMode: (mode: ThemeMode) => void;
  
  /**
   * Toggle between light and dark
   */
  toggleTheme: () => void;
  
  /**
   * Register a custom theme
   */
  registerTheme: (name: string, theme: Theme) => void;
  
  /**
   * Get a registered theme by name
   */
  getTheme: (name: string) => Theme | undefined;
  
  /**
   * Get all registered themes
   */
  getAllThemes: () => Record<string, Theme>;
  
  /**
   * Apply a custom theme by name
   */
  applyTheme: (name: string) => void;
  
  /**
   * System preference (light or dark)
   */
  systemPreference: ResolvedTheme;
}
