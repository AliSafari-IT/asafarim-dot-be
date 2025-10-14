# @asafarim/shared-i18n

Centralized multi-language system for ASafariM monorepo with i18next support for Belgian Dutch (nl) and English (en).

## Features

- 🌍 Support for English (en) and Belgian Dutch (nl)
- 🔄 Automatic cookie-based language persistence across all subdomains
- 🔐 Backend integration with user preferences API
- ⚡ Lazy loading support for app-specific translations
- 🎨 Seamless integration with existing theming system
- 🪝 React hooks for easy language management

## Installation

This package is part of the ASafariM monorepo and uses workspace dependencies.

```bash
pnpm add @asafarim/shared-i18n
```

## Usage

### 1. Initialize i18n in your app

In your app's main entry point (e.g., `main.tsx`):

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '@asafarim/shared-i18n';
import App from './App';

// Import app-specific translations (optional)
import enApp from './locales/en/app.json';
import nlApp from './locales/nl/app.json';

// Initialize i18n with optional app-specific translations
initI18n({
  defaultNS: 'common',
  ns: ['common', 'app'],
  resources: {
    en: { app: enApp },
    nl: { app: nlApp }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 2. Use translations in components

```tsx
import { useTranslation } from '@asafarim/shared-i18n';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('app:customKey')}</p>
    </div>
  );
}
```

### 3. Add language switcher

```tsx
import { LanguageSwitcher } from '@asafarim/shared-ui-react';

function Header() {
  return (
    <header>
      <nav>
        {/* Dropdown variant */}
        <LanguageSwitcher variant="dropdown" />
        
        {/* Or toggle variant */}
        <LanguageSwitcher variant="toggle" />
      </nav>
    </header>
  );
}
```

### 4. Use language hook

```tsx
import { useLanguage } from '@asafarim/shared-i18n';

function LanguageSettings() {
  const { language, changeLanguage, isChanging } = useLanguage();
  
  return (
    <div>
      <p>Current language: {language}</p>
      <button 
        onClick={() => changeLanguage('nl')}
        disabled={isChanging}
      >
        Switch to Dutch
      </button>
    </div>
  );
}
```

## API Reference

### `initI18n(config?: I18nConfig)`

Initialize i18next with the shared configuration.

**Parameters:**
- `config.defaultNS` - Default namespace (default: 'common')
- `config.ns` - Array of namespaces to load (default: ['common'])
- `config.resources` - App-specific translation resources

### `useLanguage()`

Hook for managing language preferences.

**Returns:**
- `language` - Current language code ('en' | 'nl')
- `changeLanguage(lang)` - Function to change language
- `isChanging` - Boolean indicating if language change is in progress

### `useTranslation()`

Re-exported from react-i18next. See [react-i18next docs](https://react.i18next.com/latest/usetranslation-hook).

## Translation Files

Common translations are provided in:
- `locales/en/common.json` - English translations
- `locales/nl/common.json` - Dutch translations

### Adding App-Specific Translations

Create translation files in your app:

```
your-app/
  src/
    locales/
      en/
        app.json
      nl/
        app.json
```

Then import and pass them to `initI18n()` as shown above.

## Backend Integration

The system automatically syncs language preferences with the backend:

- On login, the Identity API sets a `preferredLanguage` cookie
- Language changes update both cookie and backend via `/api/me/preferences`
- User preferences are stored in the database

## Cookie Configuration

The `preferredLanguage` cookie is set with:
- Domain: `.asafarim.be` (shared across all subdomains)
- Path: `/`
- Expiration: 1 year
- SameSite: Lax
- HttpOnly: false (accessible by JavaScript)

## Environment Variables

For backend API integration, set:

```env
VITE_IDENTITY_API_URL=https://identity.asafarim.be
```

## Supported Languages

- `en` - English
- `nl` - Nederlands (Belgian Dutch)

To add more languages, update:
1. `SUPPORTED_LANGUAGES` in `config/i18n.ts`
2. Add translation files in `locales/[lang]/common.json`
3. Update backend validation in `UserPreferencesDto.cs`
