# Usage Examples

## Basic Setup

### Simple App

```tsx
import { ThemeProvider, ThemeToggle, useTheme } from '@asafarim/react-themes';

function App() {
  return (
    <ThemeProvider>
      <Header />
      <Main />
    </ThemeProvider>
  );
}

function Header() {
  const { resolvedTheme } = useTheme();
  
  return (
    <header style={{
      background: 'var(--theme-color-surface)',
      borderBottom: '1px solid var(--theme-color-border)',
      padding: 'var(--theme-spacing-md)',
    }}>
      <h1>My App ({resolvedTheme} mode)</h1>
      <ThemeToggle />
    </header>
  );
}
```

## Advanced Usage

### Custom Theme Configuration

```tsx
import { ThemeProvider } from '@asafarim/react-themes';

const config = {
  defaultMode: 'dark',
  storageKey: 'my-app-theme',
  enableTransitions: true,
  transitionDuration: 300,
  onThemeChange: (theme) => {
    console.log('Theme changed to:', theme);
    // Analytics, etc.
  },
};

function App() {
  return (
    <ThemeProvider config={config}>
      <YourApp />
    </ThemeProvider>
  );
}
```

### Creating and Using Custom Themes

```tsx
import { ThemeProvider, useTheme } from '@asafarim/react-themes';
import type { Theme } from '@asafarim/react-themes';

// Define custom themes
const oceanTheme: Theme = {
  name: 'ocean',
  mode: 'dark',
  colors: {
    primary: '#0ea5e9',
    primaryHover: '#0284c7',
    primaryActive: '#0369a1',
    secondary: '#06b6d4',
    secondaryHover: '#0891b2',
    secondaryActive: '#0e7490',
    background: '#0c4a6e',
    backgroundSecondary: '#075985',
    backgroundTertiary: '#0369a1',
    surface: '#075985',
    surfaceHover: '#0369a1',
    surfaceActive: '#0284c7',
    text: '#f0f9ff',
    textSecondary: '#e0f2fe',
    textTertiary: '#bae6fd',
    textInverse: '#0c4a6e',
    border: '#0369a1',
    borderHover: '#0284c7',
    borderFocus: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#0ea5e9',
    accent: '#06b6d4',
    muted: '#075985',
  },
};

const sunsetTheme: Theme = {
  name: 'sunset',
  mode: 'light',
  colors: {
    primary: '#f97316',
    primaryHover: '#ea580c',
    primaryActive: '#c2410c',
    secondary: '#fb923c',
    secondaryHover: '#f97316',
    secondaryActive: '#ea580c',
    background: '#fff7ed',
    backgroundSecondary: '#ffedd5',
    backgroundTertiary: '#fed7aa',
    surface: '#ffffff',
    surfaceHover: '#fff7ed',
    surfaceActive: '#ffedd5',
    text: '#431407',
    textSecondary: '#7c2d12',
    textTertiary: '#9a3412',
    textInverse: '#ffffff',
    border: '#fed7aa',
    borderHover: '#fdba74',
    borderFocus: '#f97316',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    accent: '#ec4899',
    muted: '#ffedd5',
  },
};

// Register themes via config
function App() {
  return (
    <ThemeProvider config={{
      themes: {
        ocean: oceanTheme,
        sunset: sunsetTheme,
      }
    }}>
      <ThemeSelector />
      <YourApp />
    </ThemeProvider>
  );
}

// Theme selector component
function ThemeSelector() {
  const { applyTheme, getAllThemes, theme } = useTheme();
  const themes = getAllThemes();
  
  return (
    <div>
      <h3>Select Theme:</h3>
      {Object.keys(themes).map((themeName) => (
        <button
          key={themeName}
          onClick={() => applyTheme(themeName)}
          style={{
            fontWeight: theme.name === themeName ? 'bold' : 'normal',
          }}
        >
          {themeName}
        </button>
      ))}
    </div>
  );
}
```

### Programmatic Theme Registration

```tsx
import { useTheme } from '@asafarim/react-themes';
import { useEffect } from 'react';

function ThemeManager() {
  const { registerTheme, applyTheme } = useTheme();
  
  useEffect(() => {
    // Register theme dynamically
    registerTheme('custom', {
      name: 'custom',
      mode: 'dark',
      colors: {
        // ... your colors
      },
    });
    
    // Apply it
    applyTheme('custom');
  }, [registerTheme, applyTheme]);
  
  return null;
}
```

## Component Examples

### Themed Card Component

```tsx
import { useTheme } from '@asafarim/react-themes';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

function Card({ title, children }: CardProps) {
  const { theme } = useTheme();
  
  return (
    <div style={{
      background: 'var(--theme-color-surface)',
      border: '1px solid var(--theme-color-border)',
      borderRadius: 'var(--theme-radius-lg)',
      padding: 'var(--theme-spacing-lg)',
      boxShadow: 'var(--theme-shadow-md)',
      transition: 'var(--theme-transition-normal)',
    }}>
      <h3 style={{
        color: 'var(--theme-color-text)',
        fontSize: 'var(--theme-font-size-xl)',
        fontWeight: 'var(--theme-font-weight-semibold)',
        marginBottom: 'var(--theme-spacing-md)',
      }}>
        {title}
      </h3>
      <div style={{
        color: 'var(--theme-color-text-secondary)',
        fontSize: 'var(--theme-font-size-base)',
        lineHeight: 'var(--theme-line-height-relaxed)',
      }}>
        {children}
      </div>
    </div>
  );
}
```

### Themed Button Component

```tsx
function Button({ children, variant = 'primary', ...props }) {
  const variantStyles = {
    primary: {
      background: 'var(--theme-color-primary)',
      color: 'var(--theme-color-text-inverse)',
      border: 'none',
    },
    secondary: {
      background: 'var(--theme-color-secondary)',
      color: 'var(--theme-color-text-inverse)',
      border: 'none',
    },
    outline: {
      background: 'transparent',
      color: 'var(--theme-color-primary)',
      border: '1px solid var(--theme-color-border)',
    },
  };
  
  return (
    <button
      style={{
        ...variantStyles[variant],
        padding: 'var(--theme-spacing-sm) var(--theme-spacing-md)',
        borderRadius: 'var(--theme-radius-md)',
        fontSize: 'var(--theme-font-size-base)',
        fontWeight: 'var(--theme-font-weight-medium)',
        cursor: 'pointer',
        transition: 'var(--theme-transition-fast)',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

## Integration Examples

### Next.js App Router

```tsx
// app/providers.tsx
'use client';

import { ThemeProvider } from '@asafarim/react-themes';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider config={{ defaultMode: 'system' }}>
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### Vite + React

```tsx
// main.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@asafarim/react-themes';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

### Docusaurus

```tsx
// src/theme/Root.tsx
import React from 'react';
import { ThemeProvider } from '@asafarim/react-themes';

export default function Root({ children }) {
  return (
    <ThemeProvider config={{
      defaultMode: 'system',
      storageKey: 'docusaurus-theme',
    }}>
      {children}
    </ThemeProvider>
  );
}

// src/theme/Navbar/index.tsx
import React from 'react';
import { ThemeToggle } from '@asafarim/react-themes';
import NavbarOriginal from '@theme-original/Navbar';

export default function Navbar(props) {
  return (
    <>
      <NavbarOriginal {...props} />
      <ThemeToggle />
    </>
  );
}
```

## CSS Examples

### Global Styles

```css
/* styles/globals.css */
:root {
  /* Override default theme values if needed */
  --theme-color-primary: #your-color;
}

body {
  background: var(--theme-color-background);
  color: var(--theme-color-text);
  font-family: var(--theme-font-family);
  font-size: var(--theme-font-size-base);
  line-height: var(--theme-line-height-normal);
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

a {
  color: var(--theme-color-primary);
  transition: color 0.2s ease-in-out;
}

a:hover {
  color: var(--theme-color-primary-hover);
}
```

### Component Styles

```css
/* Card.module.css */
.card {
  background: var(--theme-color-surface);
  border: 1px solid var(--theme-color-border);
  border-radius: var(--theme-radius-lg);
  padding: var(--theme-spacing-lg);
  box-shadow: var(--theme-shadow-md);
  transition: all var(--theme-transition-normal);
}

.card:hover {
  box-shadow: var(--theme-shadow-lg);
  border-color: var(--theme-color-border-hover);
}

.card-title {
  color: var(--theme-color-text);
  font-size: var(--theme-font-size-xl);
  font-weight: var(--theme-font-weight-semibold);
  margin-bottom: var(--theme-spacing-md);
}

.card-content {
  color: var(--theme-color-text-secondary);
  font-size: var(--theme-font-size-base);
  line-height: var(--theme-line-height-relaxed);
}
```

## Testing

### Testing with Theme Context

```tsx
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@asafarim/react-themes';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders with light theme', () => {
    render(
      <ThemeProvider config={{ defaultMode: 'light' }}>
        <MyComponent />
      </ThemeProvider>
    );
    
    // Your assertions
  });
  
  it('renders with dark theme', () => {
    render(
      <ThemeProvider config={{ defaultMode: 'dark' }}>
        <MyComponent />
      </ThemeProvider>
    );
    
    // Your assertions
  });
});
```
