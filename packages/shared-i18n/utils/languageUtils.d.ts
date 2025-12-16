import { type SupportedLanguage } from '../config/i18n.js';
/**
 * Get language from cookie
 */
export declare const getLanguageFromCookie: () => string | null;
/**
 * Set language cookie for .asafarim.be domain
 */
export declare const setLanguageCookie: (language: string) => void;
/**
 * Validate if language is supported
 */
export declare const isSupportedLanguage: (lang: string) => lang is SupportedLanguage;
/**
 * Get browser language with fallback
 */
export declare const getBrowserLanguage: () => SupportedLanguage;
/**
 * Get initial language from cookie, browser, or default
 */
export declare const getInitialLanguage: () => SupportedLanguage;
/**
 * Update user language preference on backend
 * Note: Language preference is stored in cookies across all apps
 * No backend sync needed - cookies are shared across .asafarim.local domain
 */
export declare const updateUserLanguagePreference: (language: SupportedLanguage) => Promise<boolean>;
/**
 * Fetch user language preference from backend
 * Note: Language preference is stored in cookies across all apps
 * No backend sync needed - cookies are shared across .asafarim.local domain
 */
export declare const fetchUserLanguagePreference: () => Promise<SupportedLanguage | null>;
//# sourceMappingURL=languageUtils.d.ts.map