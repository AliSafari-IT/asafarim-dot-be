/// <reference types="vite/client" />

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '@asafarim/shared-i18n' {
  export function useTranslation(ns?: string): { t: (key: string) => string };
}

declare module '@asafarim/shared-i18n' {
  export function initI18n(config?: any): void;
  export function useTranslation(ns?: string | string[]): { t: (key: string, vars?: Record<string, unknown>) => string };
  export function useLanguage(): { language: string; changeLanguage(lang: string): Promise<void>; isChanging: boolean };
  export const LANGUAGE_NAMES: Record<string, string>;
  export const LANGUAGE_COOKIE_NAME: string;
  export type SupportedLanguage = 'en' | 'nl';
}