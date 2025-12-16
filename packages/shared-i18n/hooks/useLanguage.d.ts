import type { SupportedLanguage } from '../config/i18n.js';
export interface UseLanguageReturn {
    language: SupportedLanguage;
    changeLanguage: (lang: SupportedLanguage) => Promise<void>;
    isChanging: boolean;
}
/**
 * Hook for managing language preferences
 * Handles both frontend (cookie) and backend (API) synchronization
 */
export declare const useLanguage: () => UseLanguageReturn;
//# sourceMappingURL=useLanguage.d.ts.map