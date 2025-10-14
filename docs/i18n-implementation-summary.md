# i18n Implementation Summary

## Overview

A centralized multi-language system has been implemented for the ASafariM monorepo, supporting Belgian Dutch (nl) and English (en) across all frontend apps and backend services.

## What Was Implemented

### 1. Frontend Package: `@asafarim/shared-i18n`

**Location:** `packages/shared-i18n/`

**Features:**
- ✅ i18next + react-i18next integration
- ✅ Cookie-based language persistence (`.asafarim.be` domain)
- ✅ Browser language detection fallback
- ✅ Backend API synchronization
- ✅ TypeScript support with proper type definitions
- ✅ Lazy loading support for app-specific translations

**Key Files:**
- `config/i18n.ts` - Main i18n configuration
- `hooks/useLanguage.ts` - React hook for language management
- `utils/languageUtils.ts` - Cookie and API utilities
- `locales/en/common.json` - English translations
- `locales/nl/common.json` - Dutch translations
- `index.ts` - Public API exports

### 2. UI Component: `LanguageSwitcher`

**Location:** `packages/shared-ui-react/components/LanguageSwitcher/`

**Features:**
- ✅ Two variants: dropdown and toggle
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Dark mode support
- ✅ Disabled state during language change
- ✅ Styled with CSS variables for theming

**Usage:**
```tsx
import { LanguageSwitcher } from '@asafarim/shared-ui-react';

// Dropdown variant
<LanguageSwitcher variant="dropdown" />

// Toggle variant
<LanguageSwitcher variant="toggle" />
```

### 3. Backend: Identity.Api

**Changes Made:**

#### AppUser Model (`AppUser.cs`)
```csharp
public class AppUser : IdentityUser<Guid> 
{ 
    public string PreferredLanguage { get; set; } = "en";
}
```

#### New Controller: `PreferencesController.cs`
- `GET /api/me/preferences` - Get user's language preference
- `POST /api/me/preferences` - Update user's language preference

#### Updated: `AuthController.cs`
- Modified `SetAuthCookies()` to set `preferredLanguage` cookie on login
- Cookie is set with user's saved preference or default "en"

#### Database Migration
- SQL script: `apis/Identity.Api/Migrations/AddPreferredLanguage.sql`
- Adds `PreferredLanguage` column to `AspNetUsers` table
- Includes check constraint for valid languages (en, nl)
- Creates index for performance

### 4. Frontend Apps Integration

All React apps have been updated with i18n support:

#### ✅ Identity Portal (`apps/identity-portal/`)
- Added `@asafarim/shared-i18n` dependency
- Initialized i18n in `main.tsx`

#### ✅ Web App (`apps/web/`)
- Added `@asafarim/shared-i18n` dependency
- Initialized i18n in `main.tsx`

#### ✅ Core App (`apps/core-app/`)
- Added `@asafarim/shared-i18n` dependency
- Initialized i18n in `main.tsx`

#### ✅ AI UI (`apps/ai-ui/`)
- Added `@asafarim/shared-i18n` dependency
- Initialized i18n in `main.tsx`

#### ✅ Blog (`apps/blog/`)
- Added `@asafarim/shared-i18n` dependency
- Ready for Docusaurus i18n integration

#### ⚠️ Jobs UI (`apps/jobs-ui/`)
- Angular app - requires separate i18n implementation
- Can still read the `preferredLanguage` cookie
- Consider using Angular's built-in i18n or ngx-translate

## Architecture

### Language Flow

```
┌─────────────────────────────────────────────────────────────┐
│                        User Login                            │
│                            ↓                                 │
│  Identity.Api sets preferredLanguage cookie (from DB)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Frontend App Loads                         │
│                            ↓                                 │
│  initI18n() reads cookie → sets initial language            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              User Changes Language                           │
│                            ↓                                 │
│  1. Update i18next (immediate UI change)                    │
│  2. Update cookie (persist across apps)                     │
│  3. POST to /api/me/preferences (sync to DB)                │
└─────────────────────────────────────────────────────────────┘
```

### Cookie Configuration

- **Name:** `preferredLanguage`
- **Domain:** `.asafarim.be` (shared across all subdomains)
- **Path:** `/`
- **Expiration:** 1 year
- **SameSite:** Lax
- **HttpOnly:** false (accessible by JavaScript)
- **Secure:** true (in production)

## Translation Keys

### Common Translations (Available in all apps)

Located in `packages/shared-i18n/locales/{en,nl}/common.json`:

- Navigation: `home`, `about`, `contact`, `services`, `blog`, `careers`
- Auth: `login`, `register`, `logout`, `email`, `password`, `forgotPassword`
- Actions: `submit`, `cancel`, `save`, `delete`, `edit`, `close`, `search`
- UI: `loading`, `error`, `success`, `warning`, `info`
- Settings: `language`, `settings`, `profile`
- Messages: `languageChanged`, `preferencesSaved`

### Adding App-Specific Translations

1. Create translation files in your app:
   ```
   apps/your-app/src/locales/
     en/app.json
     nl/app.json
   ```

2. Import and initialize:
   ```tsx
   import enApp from './locales/en/app.json';
   import nlApp from './locales/nl/app.json';
   
   initI18n({
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
   t('common:welcome')  // or just t('welcome')
   t('app:customKey')
   ```

## Setup Instructions

### Quick Setup

Run the automated setup script:

```bash
chmod +x scripts/setup-i18n.sh
./scripts/setup-i18n.sh
```

### Manual Setup

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Build shared packages:**
   ```bash
   cd packages/shared-i18n && pnpm build
   cd ../shared-ui-react && pnpm build
   ```

3. **Run database migration:**
   ```bash
   cd apis/Identity.Api
   dotnet ef migrations add AddPreferredLanguageToUser
   dotnet ef database update
   ```

4. **Start development:**
   ```bash
   pnpm dev  # Frontend apps
   pnpm api  # Backend APIs
   ```

## Testing Checklist

### Frontend Testing

- [ ] Language switcher appears in all apps
- [ ] Clicking switcher changes UI language immediately
- [ ] Language persists after page refresh
- [ ] Language persists across different apps (same domain)
- [ ] Browser language is detected on first visit
- [ ] Translations display correctly in both languages

### Backend Testing

- [ ] Login sets `preferredLanguage` cookie
- [ ] `GET /api/me/preferences` returns user's language
- [ ] `POST /api/me/preferences` updates user's language
- [ ] Database stores language preference correctly
- [ ] Cookie is set with correct domain (`.asafarim.be`)

### Integration Testing

1. **New User Flow:**
   - Register new user
   - Verify default language is "en"
   - Change language to "nl"
   - Logout and login
   - Verify language is still "nl"

2. **Cross-App Flow:**
   - Login to Identity Portal
   - Change language to "nl"
   - Navigate to Web app
   - Verify language is "nl"
   - Navigate to Core app
   - Verify language is "nl"

3. **Cookie Persistence:**
   - Set language to "nl"
   - Close browser
   - Reopen browser
   - Visit any app
   - Verify language is "nl"

## Environment Variables

Add to each app's `.env` file:

```env
# Production
VITE_IDENTITY_API_URL=https://identity.asafarim.be

# Local Development
VITE_IDENTITY_API_URL=https://identity.asafarim.local:5177
```

## File Structure

```
asafarim-dot-be/
├── packages/
│   ├── shared-i18n/
│   │   ├── config/
│   │   │   └── i18n.ts
│   │   ├── hooks/
│   │   │   └── useLanguage.ts
│   │   ├── locales/
│   │   │   ├── en/
│   │   │   │   └── common.json
│   │   │   └── nl/
│   │   │       └── common.json
│   │   ├── utils/
│   │   │   └── languageUtils.ts
│   │   ├── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   └── shared-ui-react/
│       └── components/
│           └── LanguageSwitcher/
│               ├── LanguageSwitcher.tsx
│               ├── LanguageSwitcher.css
│               └── index.ts
├── apis/
│   └── Identity.Api/
│       ├── Controllers/
│       │   ├── AuthController.cs (modified)
│       │   └── PreferencesController.cs (new)
│       ├── DTOs/
│       │   └── UserPreferencesDto.cs (new)
│       ├── Migrations/
│       │   └── AddPreferredLanguage.sql
│       └── AppUser.cs (modified)
├── apps/
│   ├── identity-portal/
│   │   ├── package.json (updated)
│   │   └── src/main.tsx (updated)
│   ├── web/
│   │   ├── package.json (updated)
│   │   └── src/main.tsx (updated)
│   ├── core-app/
│   │   ├── package.json (updated)
│   │   └── src/main.tsx (updated)
│   ├── ai-ui/
│   │   ├── package.json (updated)
│   │   └── src/main.tsx (updated)
│   └── blog/
│       └── package.json (updated)
├── docs/
│   ├── i18n-integration-guide.md
│   └── i18n-implementation-summary.md (this file)
└── scripts/
    └── setup-i18n.sh
```

## API Endpoints

### GET /api/me/preferences

Get current user's language preference.

**Authentication:** Required

**Response:**
```json
{
  "preferredLanguage": "en"
}
```

### POST /api/me/preferences

Update current user's language preference.

**Authentication:** Required

**Request:**
```json
{
  "preferredLanguage": "nl"
}
```

**Response:**
```json
{
  "preferredLanguage": "nl"
}
```

**Validation:**
- `preferredLanguage` must be "en" or "nl"

## Future Enhancements

### Potential Improvements

1. **Additional Languages:**
   - French (fr) for Belgium
   - German (de) for Belgium
   - Other European languages

2. **Translation Management:**
   - Admin UI for managing translations
   - Export/import translation files
   - Translation versioning

3. **Advanced Features:**
   - Pluralization support
   - Date/time formatting per locale
   - Number formatting per locale
   - RTL language support

4. **Performance:**
   - Lazy load translations per route
   - Translation caching
   - CDN for translation files

5. **Developer Experience:**
   - Translation key autocomplete
   - Missing translation warnings
   - Translation coverage reports

## Troubleshooting

### Language not changing

1. Check browser console for errors
2. Verify `initI18n()` is called before app renders
3. Check that shared-i18n package is built
4. Verify cookie is being set (DevTools > Application > Cookies)

### Translations not loading

1. Verify translation files exist in `packages/shared-i18n/locales/`
2. Check that the key exists in the JSON file
3. Ensure namespace is correct (default is 'common')

### Backend API errors

1. Verify Identity API is running
2. Check that database migration was applied
3. Verify user is authenticated (check for auth cookies)
4. Check API logs for detailed error messages

### Cookie not persisting

1. Verify domain is set to `.asafarim.be`
2. Check that cookie expiration is set correctly
3. Ensure browser is not blocking third-party cookies
4. For local development, use `.asafarim.local`

## Support

For questions or issues:
1. Check the integration guide: `docs/i18n-integration-guide.md`
2. Review the shared-i18n README: `packages/shared-i18n/README.md`
3. Check existing translations: `packages/shared-i18n/locales/`

## Conclusion

The i18n system is now fully integrated across the ASafariM monorepo. All React-based frontend apps support language switching with automatic persistence via cookies and backend synchronization. Users can seamlessly switch between English and Belgian Dutch, with their preference saved and applied across all applications.
