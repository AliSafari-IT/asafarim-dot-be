// Main exports
export { initI18n, SUPPORTED_LANGUAGES, LANGUAGE_NAMES, DEFAULT_LANGUAGE, LANGUAGE_COOKIE_NAME } from './config/i18n.js';
// Hooks
export { useLanguage } from './hooks/useLanguage.js';
// Utils
export { getLanguageFromCookie, setLanguageCookie, isSupportedLanguage, getBrowserLanguage, getInitialLanguage, updateUserLanguagePreference, fetchUserLanguagePreference } from './utils/languageUtils.js';
// Re-export react-i18next for convenience
export { useTranslation, Trans, Translation } from 'react-i18next';
