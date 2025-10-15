import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import common translations
import enCommon from '../locales/en/common.json';
import nlCommon from '../locales/nl/common.json';

// Import web app translations
import enWeb from '../locales/en/web.json';
import nlWeb from '../locales/nl/web.json';

export const SUPPORTED_LANGUAGES = ['en', 'nl'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  nl: 'Nederlands'
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const LANGUAGE_COOKIE_NAME = 'preferredLanguage';

export interface I18nConfig {
  defaultNS?: string;
  ns?: string[];
  resources?: Record<string, Record<string, any>>;
}

export const initI18n = (config?: I18nConfig) => {
  const { defaultNS = 'common', ns = ['common', 'web'], resources = {} } = config || {};

  // Merge common translations with app-specific resources
  const mergedResources = {
    en: {
      common: enCommon,
      web: enWeb,
      ...resources.en
    },
    nl: {
      common: nlCommon,
      web: nlWeb,
      ...resources.nl
    }
  };

  i18n
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      resources: mergedResources,
      fallbackLng: DEFAULT_LANGUAGE,
      defaultNS,
      ns,
      supportedLngs: SUPPORTED_LANGUAGES,
      detection: {
        order: ['cookie', 'navigator'],
        caches: ['cookie'],
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
