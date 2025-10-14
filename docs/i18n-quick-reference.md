# i18n Quick Reference Card

## 🚀 Quick Start

### 1. Initialize in your app
```tsx
import { initI18n } from '@asafarim/shared-i18n';

initI18n();  // Call before rendering
```

### 2. Use translations in components
```tsx
import { useTranslation } from '@asafarim/shared-i18n';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('welcome')}</h1>;
}
```

### 3. Add language switcher
```tsx
import { LanguageSwitcher } from '@asafarim/shared-ui-react';

<LanguageSwitcher variant="toggle" />
```

## 📚 Common Translation Keys

| Key | English | Dutch |
|-----|---------|-------|
| `welcome` | Welcome | Welkom |
| `login` | Login | Inloggen |
| `logout` | Logout | Uitloggen |
| `email` | Email | E-mail |
| `password` | Password | Wachtwoord |
| `submit` | Submit | Verzenden |
| `cancel` | Cancel | Annuleren |
| `save` | Save | Opslaan |
| `delete` | Delete | Verwijderen |
| `search` | Search | Zoeken |
| `loading` | Loading... | Laden... |
| `home` | Home | Home |
| `about` | About | Over ons |
| `contact` | Contact | Contact |
| `services` | Services | Diensten |

## 🎨 LanguageSwitcher Variants

```tsx
// Dropdown (default)
<LanguageSwitcher variant="dropdown" />

// Toggle button
<LanguageSwitcher variant="toggle" />

// With custom className
<LanguageSwitcher variant="toggle" className="my-custom-class" />
```

## 🪝 useLanguage Hook

```tsx
import { useLanguage } from '@asafarim/shared-i18n';

function LanguageSettings() {
  const { language, changeLanguage, isChanging } = useLanguage();
  
  return (
    <div>
      <p>Current: {language}</p>
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

## 🌐 Supported Languages

- `en` - English
- `nl` - Nederlands (Belgian Dutch)

## 🔧 Advanced Usage

### With interpolation
```tsx
t('copyright', { year: 2025 })
// Output: © 2025 ASafariM. All rights reserved.
```

### App-specific translations
```tsx
// Initialize with custom namespace
initI18n({
  ns: ['common', 'app'],
  resources: {
    en: { app: enApp },
    nl: { app: nlApp }
  }
});

// Use in component
t('app:customKey')
```

### Multiple namespaces
```tsx
const { t } = useTranslation(['common', 'app']);

t('common:welcome')
t('app:customKey')
```

## 🍪 Cookie Details

- **Name:** `preferredLanguage`
- **Domain:** `.asafarim.be`
- **Expiration:** 1 year
- **Values:** `en` | `nl`

## 🔌 API Endpoints

### Get user preference
```bash
GET https://identity.asafarim.be/api/me/preferences
```

### Update user preference
```bash
POST https://identity.asafarim.be/api/me/preferences
Content-Type: application/json

{
  "preferredLanguage": "nl"
}
```

## 📦 Package Dependencies

Add to your app's `package.json`:
```json
{
  "dependencies": {
    "@asafarim/shared-i18n": "workspace:*",
    "@asafarim/shared-ui-react": "workspace:*"
  }
}
```

## 🛠️ Setup Commands

```bash
# Install dependencies
pnpm install

# Build shared packages
cd packages/shared-i18n && pnpm build
cd packages/shared-ui-react && pnpm build

# Run database migration
cd apis/Identity.Api
dotnet ef migrations add AddPreferredLanguageToUser
dotnet ef database update

# Or use the automated script
./scripts/setup-i18n.sh
```

## 🐛 Debugging

### Check current language
```tsx
import { useTranslation } from '@asafarim/shared-i18n';

const { i18n } = useTranslation();
console.log('Current language:', i18n.language);
```

### Check available translations
```tsx
console.log('Resources:', i18n.options.resources);
```

### Force language change
```tsx
const { i18n } = useTranslation();
await i18n.changeLanguage('nl');
```

## 📝 Adding New Translations

1. Edit `packages/shared-i18n/locales/en/common.json`
2. Edit `packages/shared-i18n/locales/nl/common.json`
3. Rebuild package: `cd packages/shared-i18n && pnpm build`
4. Use in components: `t('yourNewKey')`

## 🎯 Best Practices

✅ **DO:**
- Initialize i18n before rendering
- Use translation keys instead of hardcoded text
- Provide fallback text for missing translations
- Keep translation keys descriptive

❌ **DON'T:**
- Hardcode text in components
- Mix languages in the same component
- Forget to rebuild after changing translations
- Use special characters in translation keys

## 📚 Documentation

- Full guide: `docs/i18n-integration-guide.md`
- Implementation summary: `docs/i18n-implementation-summary.md`
- Package README: `packages/shared-i18n/README.md`
