# i18n Integration Guide for ASafariM Apps

This guide shows how to integrate the `@asafarim/shared-i18n` package into each frontend app.

## Prerequisites

1. Install dependencies in the monorepo root:
```bash
pnpm install
```

2. Build the shared-i18n package:
```bash
cd packages/shared-i18n
pnpm build
```

## Integration Steps for Each App

### 1. Identity Portal

**File: `apps/identity-portal/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/identity-portal/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import { initI18n } from '@asafarim/shared-i18n'
import Root from './theme/Root/index.tsx'

// Initialize i18n before rendering
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={{defaultMode: 'light', storageKey: 'asafarim-theme'}}>
      <Root>
        <App />
      </Root>
    </ThemeProvider>
  </StrictMode>,
)
```

**Add LanguageSwitcher to Header/Navbar:**

```tsx
import { LanguageSwitcher } from '@asafarim/shared-ui-react';

// In your header component
<nav>
  {/* ... other nav items */}
  <LanguageSwitcher variant="toggle" />
</nav>
```

### 2. Web App

**File: `apps/web/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/web/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import { initI18n } from '@asafarim/shared-i18n'

// Initialize i18n
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={{defaultMode: 'light', storageKey: 'asafarim-theme'}}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
```

### 3. Core App

**File: `apps/core-app/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/core-app/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initI18n } from '@asafarim/shared-i18n'

// Initialize i18n
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 4. AI UI

**File: `apps/ai-ui/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/ai-ui/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initI18n } from '@asafarim/shared-i18n'

// Initialize i18n
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 5. Jobs UI

**File: `apps/jobs-ui/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/jobs-ui/src/main.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initI18n } from '@asafarim/shared-i18n'

// Initialize i18n
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### 6. Blog

**File: `apps/blog/package.json`**

Add dependency:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    // ... other dependencies
  }
}
```

**File: `apps/blog/src/main.tsx` or `apps/blog/src/index.tsx`**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initI18n } from '@asafarim/shared-i18n'

// Initialize i18n
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

## Using Translations in Components

### Basic Usage

```tsx
import { useTranslation } from '@asafarim/shared-i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button>{t('submit')}</button>
      <p>{t('copyright', { year: new Date().getFullYear() })}</p>
    </div>
  );
}
```

### With Language Switcher

```tsx
import { useTranslation } from '@asafarim/shared-i18n';
import { LanguageSwitcher } from '@asafarim/shared-ui-react';

function Header() {
  const { t } = useTranslation();
  
  return (
    <header>
      <nav>
        <a href="/">{t('home')}</a>
        <a href="/about">{t('about')}</a>
        <a href="/contact">{t('contact')}</a>
        <LanguageSwitcher variant="toggle" />
      </nav>
    </header>
  );
}
```

### Advanced: App-Specific Translations

If your app needs custom translations beyond the common ones:

1. Create translation files:
```
apps/your-app/src/locales/
  en/
    app.json
  nl/
    app.json
```

2. Import and initialize:
```tsx
import { initI18n } from '@asafarim/shared-i18n';
import enApp from './locales/en/app.json';
import nlApp from './locales/nl/app.json';

initI18n({
  defaultNS: 'common',
  ns: ['common', 'app'],
  resources: {
    en: { app: enApp },
    nl: { app: nlApp }
  }
});
```

3. Use in components:
```tsx
const { t } = useTranslation();
// Common translations (default namespace)
t('welcome')
// App-specific translations
t('app:customKey')
```

## Backend Migration

A database migration is required to add the `PreferredLanguage` column to the `AspNetUsers` table.

**Run migration:**

```bash
cd apis/Identity.Api
dotnet ef migrations add AddPreferredLanguageToUser
dotnet ef database update
```

## Testing

1. **Test language switching:**
   - Open any app
   - Click the language switcher
   - Verify the UI updates immediately
   - Check that the cookie is set (DevTools > Application > Cookies)

2. **Test persistence:**
   - Switch language
   - Refresh the page
   - Verify the selected language persists

3. **Test cross-app persistence:**
   - Switch language in Identity Portal
   - Navigate to another app (e.g., Web)
   - Verify the language is the same

4. **Test backend sync:**
   - Login to an app
   - Switch language
   - Check Network tab for POST to `/api/me/preferences`
   - Logout and login again
   - Verify the language preference is restored

## Environment Variables

Add to each app's `.env` file (if not already present):

```env
VITE_IDENTITY_API_URL=https://identity.asafarim.be
```

For local development:
```env
VITE_IDENTITY_API_URL=https://identity.asafarim.local:5177
```

## Troubleshooting

### Language not persisting
- Check that the cookie domain is set correctly (`.asafarim.be`)
- Verify the cookie is not being blocked by browser settings
- Check browser console for errors

### Translations not loading
- Ensure `initI18n()` is called before rendering the app
- Check that translation files exist in `packages/shared-i18n/locales/`
- Verify the package is built (`cd packages/shared-i18n && pnpm build`)

### Backend API errors
- Verify the Identity API is running
- Check that the `PreferredLanguage` column exists in the database
- Verify the user is authenticated (cookie present)

## Next Steps

1. Add more translations to `locales/en/common.json` and `locales/nl/common.json`
2. Create app-specific translation files as needed
3. Add language detection based on browser settings (already implemented as fallback)
4. Consider adding more languages (e.g., French for Belgium)
