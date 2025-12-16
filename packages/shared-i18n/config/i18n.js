import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
// Import common translations
import enCommon from '../locales/en/common.json';
import nlCommon from '../locales/nl/common.json';
// Import identity-portal translations
import enIdentityPortal from '../locales/en/identity-portal.json';
import nlIdentityPortal from '../locales/nl/identity-portal.json';
export const SUPPORTED_LANGUAGES = ['en', 'nl'];
export const LANGUAGE_NAMES = {
    en: 'English',
    nl: 'Nederlands'
};
export const DEFAULT_LANGUAGE = 'en';
export const LANGUAGE_COOKIE_NAME = 'preferredLanguage';
export const initI18n = (config) => {
    const resources = config?.resources;
    const supportedLngs = config?.supportedLngs;
    const defaultLanguage = config?.defaultLanguage;
    const defaultNS = config?.defaultNS;
    const ns = config?.ns;
    // const {
    //   defaultNS = 'common',
    //   ns = ['common', 'identityPortal'],
    //   resources,
    //   supportedLngs,
    //   defaultLanguage,
    // } = config || {};
    // Merge common translations with app-specific resources
    const mergedResources = { ...config?.resources };
    mergedResources.en = {
        common: enCommon,
        identityPortal: enIdentityPortal,
        ...(resources?.en || {}),
    };
    mergedResources.nl = {
        common: nlCommon,
        identityPortal: nlIdentityPortal,
        ...(resources?.nl || {}),
    };
    const finalSupportedLngs = supportedLngs ?? Object.keys(mergedResources);
    const fallbackLng = defaultLanguage ?? DEFAULT_LANGUAGE;
    i18n
        .use(initReactI18next)
        .use(LanguageDetector)
        .init({
        resources: mergedResources,
        fallbackLng,
        defaultNS,
        ns,
        supportedLngs: finalSupportedLngs,
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
