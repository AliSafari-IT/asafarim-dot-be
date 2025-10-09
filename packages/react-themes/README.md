# @asafarim/react-themes

A comprehensive, type-safe theme management system for React applications with automatic dark/light mode detection, persistent user selection, and smooth CSS variable-based transitions.

## Features

✨ **Automatic System Detection** - Detects and responds to system theme preference changes  
🎨 **Custom Theme Support** - Register and apply custom themes with full type safety  
💾 **Persistent Storage** - Saves user preference to localStorage  
🔄 **Smooth Transitions** - CSS variable-based transitions between themes  
📦 **Lightweight** - Zero dependencies (except React peer dependency)  
🎯 **Type-Safe** - Full TypeScript support with IntelliSense  
🌐 **Framework Agnostic** - Works with any React app (Next.js, Vite, CRA, Docusaurus, etc.)

## Installation

```bash
pnpm add @asafarim/react-themes
```

## Quick Start

### 1. Wrap your app with ThemeProvider

```tsx
import { ThemeProvider } from '@asafarim/react-themes';

function App() {
  return (
    <ThemeProvider>
      <YourApp />
    </ThemeProvider>
  );
}
```

### 2. Use the theme in your components

```tsx
import { useTheme, ThemeToggle } from '@asafarim/react-themes';

function Header() {
  const { mode, resolvedTheme, theme } = useTheme();
  
  return (
    <header>
      <h1>Current mode: {mode}</h1>
      <p>Resolved theme: {resolvedTheme}</p>
      <ThemeToggle />
    </header>
  );
}
```

### 3. Use CSS variables in your styles

```css
.my-component {
  background: var(--theme-color-background);
  color: var(--theme-color-text);
  border: 1px solid var(--theme-color-border);
  border-radius: var(--theme-radius-md);
  padding: var(--theme-spacing-md);
  box-shadow: var(--theme-shadow-md);
}
```

## API Reference

### ThemeProvider

The main provider component that manages theme state.

```tsx
<ThemeProvider config={{
  defaultMode: 'system',           // 'light' | 'dark' | 'system'
  storageKey: 'theme-mode',        // localStorage key
  enableTransitions: true,         // Enable smooth transitions
  transitionDuration: 200,         // Transition duration in ms
  attribute: 'data-theme',         // Attribute to set on <html>
  themes: {},                      // Custom themes
  onThemeChange: (theme) => {},    // Callback on theme change
}}>
  {children}
</ThemeProvider>
```

### useTheme Hook

Access theme state and controls.

```tsx
const {
  mode,              // Current mode: 'light' | 'dark' | 'system'
  resolvedTheme,     // Actual theme: 'light' | 'dark'
  theme,             // Current theme object
  setMode,           // Set theme mode
  toggleTheme,       // Toggle between light/dark
  registerTheme,     // Register custom theme
  getTheme,          // Get theme by name
  getAllThemes,      // Get all registered themes
  applyTheme,        // Apply custom theme
  systemPreference,  // System preference: 'light' | 'dark'
} = useTheme();
```

### Components

#### ThemeToggle

A button that toggles between light and dark themes.

```tsx
<ThemeToggle 
  className="custom-class"
  lightIcon={<SunIcon />}
  darkIcon={<MoonIcon />}
  ariaLabel="Toggle theme"
/>
```

#### ThemeSelect

A select dropdown for choosing theme mode.

```tsx
<ThemeSelect 
  className="custom-class"
  showLabels={true}
  labels={{
    light: 'Light Mode',
    dark: 'Dark Mode',
    system: 'System Default'
  }}
/>
```

## Custom Themes

### Creating a Custom Theme

```tsx
import { Theme } from '@asafarim/react-themes';

const customTheme: Theme = {
  name: 'ocean',
  mode: 'dark',
  colors: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryActive: '#0369a1',
    background: '#0c4a6e',
    text: '#f0f9ff',
    // ... other colors
  },
  // Optional: spacing, typography, shadows, etc.
};
```

### Registering and Using Custom Themes

```tsx
// Option 1: Via config
<ThemeProvider config={{ themes: { ocean: customTheme } }}>
  {children}
</ThemeProvider>

// Option 2: Programmatically
function MyComponent() {
  const { registerTheme, applyTheme } = useTheme();
  
  useEffect(() => {
    registerTheme('ocean', customTheme);
    applyTheme('ocean');
  }, []);
}
```

## CSS Variables Reference

### Colors

- `--theme-color-primary`, `--theme-color-primary-hover`, `--theme-color-primary-active`
- `--theme-color-secondary`, `--theme-color-secondary-hover`, `--theme-color-secondary-active`
- `--theme-color-background`, `--theme-color-background-secondary`, `--theme-color-background-tertiary`
- `--theme-color-surface`, `--theme-color-surface-hover`, `--theme-color-surface-active`
- `--theme-color-text`, `--theme-color-text-secondary`, `--theme-color-text-tertiary`, `--theme-color-text-inverse`
- `--theme-color-border`, `--theme-color-border-hover`, `--theme-color-border-focus`
- `--theme-color-success`, `--theme-color-warning`, `--theme-color-error`, `--theme-color-info`
- `--theme-color-accent`, `--theme-color-muted`

### Spacing

- `--theme-spacing-xs`, `--theme-spacing-sm`, `--theme-spacing-md`, `--theme-spacing-lg`, `--theme-spacing-xl`, `--theme-spacing-2xl`, `--theme-spacing-3xl`

### Typography

- `--theme-font-family`, `--theme-font-family-mono`
- `--theme-font-size-xs`, `--theme-font-size-sm`, `--theme-font-size-base`, `--theme-font-size-lg`, `--theme-font-size-xl`, `--theme-font-size-2xl`, `--theme-font-size-3xl`, `--theme-font-size-4xl`
- `--theme-font-weight-light`, `--theme-font-weight-normal`, `--theme-font-weight-medium`, `--theme-font-weight-semibold`, `--theme-font-weight-bold`
- `--theme-line-height-tight`, `--theme-line-height-normal`, `--theme-line-height-relaxed`, `--theme-line-height-loose`

### Shadows

- `--theme-shadow-sm`, `--theme-shadow-md`, `--theme-shadow-lg`, `--theme-shadow-xl`, `--theme-shadow-2xl`, `--theme-shadow-inner`, `--theme-shadow-none`

### Border Radius

- `--theme-radius-none`, `--theme-radius-sm`, `--theme-radius-md`, `--theme-radius-lg`, `--theme-radius-xl`, `--theme-radius-2xl`, `--theme-radius-full`

### Transitions

- `--theme-transition-fast`, `--theme-transition-normal`, `--theme-transition-slow`

## Usage with Docusaurus

```tsx
// src/theme/Root.tsx
import React from 'react';
import { ThemeProvider } from '@asafarim/react-themes';

export default function Root({ children }) {
  return (
    <ThemeProvider config={{ defaultMode: 'system' }}>
      {children}
    </ThemeProvider>
  );
}
```

## TypeScript Support

Full TypeScript support with comprehensive type definitions:

```tsx
import type { 
  Theme, 
  ThemeMode, 
  ThemeConfig,
  ThemeContextValue 
} from '@asafarim/react-themes';
```

## License

CC BY 4.0

## Author

ASafariM
