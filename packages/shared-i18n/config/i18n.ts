import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getLanguageFromCookie, setLanguageCookie } from '../utils/languageUtils';

// Import common translations
import enCommon from '../locales/en/common.json';
import nlCommon from '../locales/nl/common.json';

export const SUPPORTED_LANGUAGES = ['en', 'nl'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  nl: 'Nederlands'
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_COOKIE_NAME = 'preferredLanguage';

// Custom language detector that prioritizes cookie
const cookieLanguageDetector = {
  name: 'cookieDetector',
  lookup() {
    return getLanguageFromCookie();
  },
  cacheUserLanguage(lng: string) {
    setLanguageCookie(lng);
  }
};

export interface I18nConfig {
  defaultNS?: string;
  ns?: string[];
  resources?: Record<string, Record<string, any>>;
}

export const initI18n = (config?: I18nConfig) => {
  const { defaultNS = 'common', ns = ['common'], resources = {} } = config || {};

  // Merge common translations with app-specific resources
  const mergedResources = {
    en: {
      common: enCommon,
      ...resources.en
    },
    nl: {
      common: nlCommon,
      ...resources.nl
    }
  };

  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .use({
      type: 'languageDetector',
      ...cookieLanguageDetector
    } as any)
    .init({
      resources: mergedResources,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS,
      ns,
      supportedLngs: SUPPORTED_LANGUAGES,
      detection: {
        order: ['cookieDetector', 'navigator'],
        caches: ['cookieDetector'],
        lookupCookie: LANGUAGE_COOKIE_NAME
      },
      interpolation: {
        escapeValue: false // React already escapes
      },
      react: {
        useSuspense: false
      }
    });

  return i18n;
};

export default i18n;
