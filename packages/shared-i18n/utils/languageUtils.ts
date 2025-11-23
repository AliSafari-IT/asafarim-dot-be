import { LANGUAGE_COOKIE_NAME, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from '../config/i18n.js';

/**
 * Resolve Identity API base URL from environment or hostname
 */
const getIdentityApiUrl = (): string => {
  // Default to local identity API in development
  let resolved = 'http://identity.asafarim.local:5101';

  try {
    // Prefer Vite env vars when available
    // Guard access to import.meta for non-Vite environments
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const viteEnv = (typeof import.meta !== 'undefined') ? ((import.meta as any).env) : undefined;

    if (viteEnv && (viteEnv as any).VITE_IDENTITY_API_URL) {
      resolved = (viteEnv as any).VITE_IDENTITY_API_URL as string;
    } else if (typeof window !== 'undefined') {
      // Fallback based on hostname for runtime environments
      const isProdHost = /asafarim\.be$/i.test(window.location.hostname);
      resolved = isProdHost ? 'https://identity.asafarim.be' : 'http://identity.asafarim.local:5101';
    }
  } catch {
    // Keep default if any detection fails
  }

  return resolved;
};

/**
 * Get language from cookie
 */
export const getLanguageFromCookie = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const languageCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${LANGUAGE_COOKIE_NAME}=`)
  );
  
  if (languageCookie) {
    const value = languageCookie.split('=')[1];
    return value || null;
  }
  
  return null;
};

/**
 * Set language cookie for .asafarim.be domain
 */
export const setLanguageCookie = (language: string): void => {
  if (typeof document === 'undefined') return;
  
  const domain = window.location.hostname.includes('asafarim.be') 
    ? '.asafarim.be' 
    : window.location.hostname;
  
  // Set cookie with 1 year expiration
  const expirationDate = new Date();
  expirationDate.setFullYear(expirationDate.getFullYear() + 1);
  
  document.cookie = `${LANGUAGE_COOKIE_NAME}=${language}; domain=${domain}; path=/; expires=${expirationDate.toUTCString()}; SameSite=Lax`;
};

/**
 * Validate if language is supported
 */
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

/**
 * Get browser language with fallback
 */
export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') return DEFAULT_LANGUAGE;
  
  const browserLang = navigator.language.split('-')[0];
  return isSupportedLanguage(browserLang) ? browserLang : DEFAULT_LANGUAGE;
};

/**
 * Get initial language from cookie, browser, or default
 */
export const getInitialLanguage = (): SupportedLanguage => {
  const cookieLang = getLanguageFromCookie();
  if (cookieLang && isSupportedLanguage(cookieLang)) {
    return cookieLang;
  }
  
  return getBrowserLanguage();
};

/**
 * Update user language preference on backend
 * Note: Language preference is stored in cookies across all apps
 * No backend sync needed - cookies are shared across .asafarim.local domain
 */
export const updateUserLanguagePreference = async (language: SupportedLanguage): Promise<boolean> => {
  try {
    const baseUrl = getIdentityApiUrl();
    const response = await fetch(`${baseUrl}/api/me/preferences`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ preferredLanguage: language }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.warn('Failed to sync language preference with backend:', response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to update language preference: ' + language, error);
    return false;
  }
};

/**
 * Fetch user language preference from backend
 * Note: Language preference is stored in cookies across all apps
 * No backend sync needed - cookies are shared across .asafarim.local domain
 */
export const fetchUserLanguagePreference = async (): Promise<SupportedLanguage | null> => {
  try {
    // Language is already available in cookie
    // No backend call needed - cookies are the source of truth
    const cookieLang = getLanguageFromCookie();
    if (cookieLang && isSupportedLanguage(cookieLang)) {
      return cookieLang;
    }
  } catch (error) {
    console.error('Failed to fetch language preference:', error);
  }
  
  return null;
};
