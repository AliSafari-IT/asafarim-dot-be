# Integration Guide for ASafariM Monorepo Apps

This guide shows how to integrate `@asafarim/react-themes` into each app in the monorepo.

## 📋 Prerequisites

The package is already built and available in the monorepo. No additional installation needed for workspace packages.

## 🎯 Integration Steps by App Type

### 1. React Apps (ai-ui, core-app, identity-portal)

#### Step 1: Add dependency to package.json

```json
{
  "dependencies": {
    "@asafarim/react-themes": "workspace:*"
  }
}
```

#### Step 2: Wrap your app with ThemeProvider

```tsx
// src/main.tsx or src/index.tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@asafarim/react-themes';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={{ defaultMode: 'system' }}>
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

#### Step 3: Add ThemeToggle to your header/navbar

```tsx
// src/components/Header.tsx or Navbar.tsx
import { ThemeToggle } from '@asafarim/react-themes';

export function Header() {
  return (
    <header>
      <nav>
        {/* Your existing nav items */}
        <ThemeToggle />
      </nav>
    </header>
  );
}
```

#### Step 4: Update your CSS to use theme variables

```css
/* src/index.css or App.css */
body {
  background: var(--theme-color-background);
  color: var(--theme-color-text);
  font-family: var(--theme-font-family);
  transition: background-color 0.2s, color 0.2s;
}

/* Update existing components */
.card {
  background: var(--theme-color-surface);
  border: 1px solid var(--theme-color-border);
  border-radius: var(--theme-radius-md);
  padding: var(--theme-spacing-md);
}

.button-primary {
  background: var(--theme-color-primary);
  color: var(--theme-color-text-inverse);
  border-radius: var(--theme-radius-md);
  padding: var(--theme-spacing-sm) var(--theme-spacing-md);
}
```

### 2. Angular App (jobs-ui)

Since jobs-ui uses Angular with React integration, you can use the theme system in React components:

#### Step 1: Add dependency to package.json

```json
{
  "dependencies": {
    "@asafarim/react-themes": "workspace:*"
  }
}
```

#### Step 2: Wrap React components with ThemeProvider

```tsx
// src/app/react-wrapper/react-wrapper.component.tsx
import { ThemeProvider } from '@asafarim/react-themes';

export function ReactComponentWrapper({ children }) {
  return (
    <ThemeProvider config={{ defaultMode: 'system' }}>
      {children}
    </ThemeProvider>
  );
}
```

#### Step 3: Use in React components

```tsx
import { useTheme, ThemeToggle } from '@asafarim/react-themes';

export function ReactHeader() {
  const { resolvedTheme } = useTheme();
  
  return (
    <header>
      <h1>Jobs UI ({resolvedTheme})</h1>
      <ThemeToggle />
    </header>
  );
}
```

### 3. Docusaurus Blog (blog)

#### Step 1: Add dependency to package.json

```json
{
  "dependencies": {
    "@asafarim/react-themes": "workspace:*"
  }
}
```

#### Step 2: Create Root wrapper

```tsx
// src/theme/Root.tsx
import React from 'react';
import { ThemeProvider } from '@asafarim/react-themes';

export default function Root({ children }) {
  return (
    <ThemeProvider config={{
      defaultMode: 'system',
      storageKey: 'asafarim-blog-theme',
    }}>
      {children}
    </ThemeProvider>
  );
}
```

#### Step 3: Add ThemeToggle to Navbar

```tsx
// src/theme/Navbar/index.tsx
import React from 'react';
import NavbarOriginal from '@theme-original/Navbar';
import { ThemeToggle } from '@asafarim/react-themes';
import type { WrapperProps } from '@docusaurus/types';
import type NavbarType from '@theme/Navbar';

type Props = WrapperProps<typeof NavbarType>;

export default function NavbarWrapper(props: Props): JSX.Element {
  return (
    <div style={{ position: 'relative' }}>
      <NavbarOriginal {...props} />
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
      }}>
        <ThemeToggle />
      </div>
    </div>
  );
}
```

#### Step 4: Update custom CSS

```css
/* src/css/custom.css */
:root {
  /* Override Docusaurus variables with theme variables */
  --ifm-color-primary: var(--theme-color-primary);
  --ifm-background-color: var(--theme-color-background);
  --ifm-font-color-base: var(--theme-color-text);
}
```

### 4. Next.js App (web)

#### Step 1: Add dependency to package.json

```json
{
  "dependencies": {
    "@asafarim/react-themes": "workspace:*"
  }
}
```

#### Step 2: Create Providers component

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
```

#### Step 3: Update root layout

```tsx
// app/layout.tsx
import { Providers } from './providers';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### Step 4: Use in components

```tsx
// app/components/Header.tsx
'use client';

import { ThemeToggle, useTheme } from '@asafarim/react-themes';

export function Header() {
  const { resolvedTheme } = useTheme();
  
  return (
    <header>
      <h1>ASafariM Web ({resolvedTheme})</h1>
      <ThemeToggle />
    </header>
  );
}
```

## 🎨 Shared UI Integration

If you want to integrate with `@asafarim/shared-ui-react`:

### Step 1: Add as peer dependency

```json
// packages/shared-ui-react/package.json
{
  "peerDependencies": {
    "@asafarim/react-themes": "workspace:*"
  }
}
```

### Step 2: Update shared components to use theme variables

```tsx
// packages/shared-ui-react/components/Button/Button.tsx
import { useTheme } from '@asafarim/react-themes';

export function Button({ variant = 'primary', children, ...props }) {
  const { theme } = useTheme();
  
  return (
    <button
      style={{
        background: variant === 'primary' 
          ? 'var(--theme-color-primary)' 
          : 'var(--theme-color-secondary)',
        color: 'var(--theme-color-text-inverse)',
        padding: 'var(--theme-spacing-sm) var(--theme-spacing-md)',
        borderRadius: 'var(--theme-radius-md)',
        border: 'none',
        cursor: 'pointer',
      }}
      {...props}
    >
      {children}
    </button>
  );
}
```

## 🔧 Custom Theme Configuration

### Create App-Specific Themes

```tsx
// src/themes/customTheme.ts
import type { Theme } from '@asafarim/react-themes';

export const brandTheme: Theme = {
  name: 'brand',
  mode: 'light',
  colors: {
    primary: '#your-brand-color',
    primaryHover: '#your-brand-hover',
    primaryActive: '#your-brand-active',
    // ... other colors matching your brand
  },
};

// Use in app
<ThemeProvider config={{ 
  themes: { brand: brandTheme },
  defaultMode: 'light'
}}>
  <App />
</ThemeProvider>
```

## 📝 CSS Migration Checklist

When migrating existing styles to use theme variables:

- [ ] Replace hardcoded colors with `var(--theme-color-*)`
- [ ] Replace spacing values with `var(--theme-spacing-*)`
- [ ] Replace border-radius with `var(--theme-radius-*)`
- [ ] Replace box-shadow with `var(--theme-shadow-*)`
- [ ] Replace font properties with `var(--theme-font-*)`
- [ ] Add transitions for smooth theme changes
- [ ] Test in both light and dark modes
- [ ] Ensure contrast ratios meet accessibility standards

## 🧪 Testing Theme Integration

```tsx
// Example test
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@asafarim/react-themes';
import { MyComponent } from './MyComponent';

describe('MyComponent with themes', () => {
  it('renders in light mode', () => {
    render(
      <ThemeProvider config={{ defaultMode: 'light' }}>
        <MyComponent />
      </ThemeProvider>
    );
    // Your assertions
  });
  
  it('renders in dark mode', () => {
    render(
      <ThemeProvider config={{ defaultMode: 'dark' }}>
        <MyComponent />
      </ThemeProvider>
    );
    // Your assertions
  });
});
```

## 🚀 Deployment Considerations

1. **Build the theme package first:**

   ```bash
   cd packages/react-themes
   pnpm build
   ```

2. **Install dependencies in apps:**

   ```bash
   pnpm install
   ```

3. **Build apps:**

   ```bash
   pnpm build
   ```

## 📞 Support

For issues or questions:

- Check [README.md](./README.md) for API reference
- See [EXAMPLES.md](./EXAMPLES.md) for usage examples
- Review [QUICKSTART.md](./QUICKSTART.md) for quick setup

## ✅ Integration Checklist

- [ ] Add `@asafarim/react-themes` to package.json
- [ ] Install dependencies (`pnpm install`)
- [ ] Wrap app with `ThemeProvider`
- [ ] Add `ThemeToggle` to header/navbar
- [ ] Update CSS to use theme variables
- [ ] Test in light and dark modes
- [ ] Verify persistence (localStorage)
- [ ] Check system preference detection
- [ ] Ensure smooth transitions
- [ ] Test on all target browsers
