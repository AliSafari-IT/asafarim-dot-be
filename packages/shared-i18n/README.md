# @asafarim/shared-i18n

Lightweight, simple translation module for any React + TypeScript app, built on top of i18next and react-i18next. It ships with sensible defaults (English and Dutch) but can support any language by adding JSON files to your locales folder.

## Features

- 🌍 Works in any React + TypeScript project (monorepo or standalone)
- 🗂️ JSON-based translations per language and namespace
- 🔄 Cookie-based language persistence (browser) with automatic detection
- ⚙️ Optional backend sync for user language preferences
- ⚡ Lazy loading support for app-specific translations
- 🪝 React hooks for language management (useLanguage) and translations (useTranslation)

## Installation

```bash
pnpm add @asafarim/shared-i18n
# or
npm i @asafarim/shared-i18n
# or
yarn add @asafarim/shared-i18n
```

## Usage

### 1) Initialize i18n in your app

In your app's main entry point (e.g., `main.tsx`):

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '@asafarim/shared-i18n';
import App from './App';

// Optional: import your app-specific translations
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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

### 2) Use translations in components

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

### 3) Add a language switcher

If you use @asafarim/shared-ui-react you can leverage its LanguageSwitcher component. Otherwise, call useLanguage directly.

```tsx
import { useLanguage } from '@asafarim/shared-i18n';

export function LanguageToggle() {
  const { language, changeLanguage, isChanging } = useLanguage();
  return (
    <button onClick={() => changeLanguage(language === 'en' ? 'nl' : 'en')} disabled={isChanging}>
      Switch language (current: {language})
    </button>
  );
}
```

## Add more languages

Yes — you can support any language by adding the required JSON files to your locales folder. For example:

```
your-app/
  src/
    locales/
      en/
        app.json
      nl/
        app.json
      anotherLang/
        new.json
```

Then include them when initializing:

```tsx
import anotherLang from './locales/anotherLang/new.json';

initI18n({
  ns: ['common', 'app', 'new'],
  resources: {
    anotherLang: { new: anotherLang }
  },
  supportedLngs: ['en', 'nl', 'anotherLang'],
  defaultLanguage: 'en'
});
```

Notes:
- If you pass supportedLngs, it will override the default supported languages.
- defaultLanguage overrides the default fallback (which is English).

## API Reference

### initI18n(config?: I18nConfig)

Initialize i18next with the shared configuration.

Parameters:
- config.defaultNS — Default namespace (default: 'common')
- config.ns — Namespaces to load (default: ['common'])
- config.resources — App-specific translation resources
- config.supportedLngs — Optional list of supported language codes to enable
- config.defaultLanguage — Optional fallback language code

### useLanguage()

Hook for managing language preferences.

Returns:
- language — Current language code
- changeLanguage(lang) — Function to change language
- isChanging — Boolean indicating if language change is in progress

### useTranslation()

Re-exported from react-i18next. See official docs.

## Cookie and backend integration

- A preferredLanguage cookie is used to persist the selected language in the browser.
- If your environment provides an Identity API, updateUserLanguagePreference can sync the preference server-side. If not, the library still works fully client-side.

To point to a backend, optionally set:

```env
VITE_IDENTITY_API_URL=https://your-identity.example.com
```

## Built-in translations

This package ships with default English and Dutch common translations. You can ignore them and supply your own resources if preferred.

## License

MIT © ASafariM

