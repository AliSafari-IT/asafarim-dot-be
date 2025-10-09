# Quick Start Guide

Get started with `@asafarim/react-themes` in 5 minutes!

## Installation

```bash
pnpm add @asafarim/react-themes
```

## Basic Setup (3 Steps)

### Step 1: Wrap your app with ThemeProvider

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

### Step 2: Add a theme toggle button

```tsx
import { ThemeToggle } from '@asafarim/react-themes';

function Header() {
  return (
    <header>
      <h1>My App</h1>
      <ThemeToggle />
    </header>
  );
}
```

### Step 3: Use CSS variables in your styles

```css
.my-component {
  background: var(--theme-color-background);
  color: var(--theme-color-text);
  border: 1px solid var(--theme-color-border);
  padding: var(--theme-spacing-md);
  border-radius: var(--theme-radius-md);
}
```

## That's it! 🎉

Your app now has:
- ✅ Automatic dark/light mode detection
- ✅ Persistent theme preference
- ✅ Smooth transitions
- ✅ Full type safety

## Next Steps

### Access theme in components

```tsx
import { useTheme } from '@asafarim/react-themes';

function MyComponent() {
  const { mode, resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <p>Current mode: {mode}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

### Customize configuration

```tsx
<ThemeProvider config={{
  defaultMode: 'dark',              // Start with dark mode
  storageKey: 'my-app-theme',       // Custom storage key
  enableTransitions: true,          // Smooth transitions
  transitionDuration: 300,          // 300ms transitions
}}>
  <YourApp />
</ThemeProvider>
```

### Create custom themes

```tsx
import type { Theme } from '@asafarim/react-themes';

const myTheme: Theme = {
  name: 'custom',
  mode: 'dark',
  colors: {
    primary: '#ff6b6b',
    background: '#1a1a2e',
    text: '#eee',
    // ... other colors
  },
};

<ThemeProvider config={{ themes: { custom: myTheme } }}>
  <YourApp />
</ThemeProvider>
```

## Common CSS Variables

### Colors
```css
var(--theme-color-primary)
var(--theme-color-background)
var(--theme-color-text)
var(--theme-color-border)
var(--theme-color-success)
var(--theme-color-error)
```

### Spacing
```css
var(--theme-spacing-xs)   /* 0.25rem */
var(--theme-spacing-sm)   /* 0.5rem */
var(--theme-spacing-md)   /* 1rem */
var(--theme-spacing-lg)   /* 1.5rem */
var(--theme-spacing-xl)   /* 2rem */
```

### Typography
```css
var(--theme-font-family)
var(--theme-font-size-base)
var(--theme-font-weight-medium)
var(--theme-line-height-normal)
```

### Other
```css
var(--theme-radius-md)        /* Border radius */
var(--theme-shadow-md)        /* Box shadow */
var(--theme-transition-normal) /* Transition timing */
```

## Full Documentation

See [README.md](./README.md) for complete documentation and [EXAMPLES.md](./EXAMPLES.md) for more examples.
