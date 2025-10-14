import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  setLanguageCookie, 
  updateUserLanguagePreference, 
  fetchUserLanguagePreference,
  isSupportedLanguage
} from '../utils/languageUtils';
import type { SupportedLanguage } from '../config/i18n';

export interface UseLanguageReturn {
  language: SupportedLanguage;
  changeLanguage: (lang: SupportedLanguage) => Promise<void>;
  isChanging: boolean;
}

/**
 * Hook for managing language preferences
 * Handles both frontend (cookie) and backend (API) synchronization
 */
export const useLanguage = (): UseLanguageReturn => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  const currentLanguage = (isSupportedLanguage(i18n.language) 
    ? i18n.language 
    : 'en') as SupportedLanguage;

  // Sync with backend on mount (for authenticated users)
  useEffect(() => {
    const syncLanguageWithBackend = async () => {
      const backendLang = await fetchUserLanguagePreference();
      if (backendLang && backendLang !== currentLanguage) {
        await i18n.changeLanguage(backendLang);
        setLanguageCookie(backendLang);
      }
    };

    syncLanguageWithBackend();
  }, []); // Only run once on mount

  const changeLanguage = useCallback(async (lang: SupportedLanguage) => {
    if (lang === currentLanguage) return;

    setIsChanging(true);
    try {
      // Update i18next
      await i18n.changeLanguage(lang);
      
      // Update cookie immediately
      setLanguageCookie(lang);
      
      // Update backend (fire and forget for better UX)
      updateUserLanguagePreference(lang).catch(err => {
        console.warn('Failed to sync language preference with backend:', err);
      });
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsChanging(false);
    }
  }, [currentLanguage, i18n]);

  return {
    language: currentLanguage,
    changeLanguage,
    isChanging
  };
};
