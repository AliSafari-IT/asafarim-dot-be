import { LANGUAGE_COOKIE_NAME, DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, SupportedLanguage } from '../config/i18n';

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
 * Get the Identity API base URL based on environment
 */
const getIdentityApiUrl = (): string => {
  // Check if we're in production based on hostname
  const isProd = typeof window !== 'undefined' && (
    window.location.hostname.includes('asafarim.be') ||
    window.location.protocol === 'https:'
  );

  if (isProd) {
    return 'https://identity.asafarim.be';
  }

  // Development: use environment variable or default to localhost
  const env = (import.meta.env as any) || {};
  return env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
};

/**
 * Update user language preference on backend
 */
export const updateUserLanguagePreference = async (language: SupportedLanguage): Promise<boolean> => {
  try {
    const baseUrl = getIdentityApiUrl();
    const response = await fetch(`${baseUrl}/api/me/preferences`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({ preferredLanguage: language })
    });
    
    return response.ok;
  } catch (error) {
    console.error('Failed to update language preference:', error);
    return false;
  }
};

/**
 * Fetch user language preference from backend
 */
export const fetchUserLanguagePreference = async (): Promise<SupportedLanguage | null> => {
  try {
    const baseUrl = getIdentityApiUrl();
    const response = await fetch(`${baseUrl}/api/me/preferences`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      const lang = data.preferredLanguage;
      return isSupportedLanguage(lang) ? lang : null;
    }
  } catch (error) {
    console.error('Failed to fetch language preference:', error);
  }
  
  return null;
};
