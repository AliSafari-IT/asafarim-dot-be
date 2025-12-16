import i18n from 'i18next';
export declare const SUPPORTED_LANGUAGES: readonly ["en", "nl"];
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];
export declare const LANGUAGE_NAMES: Record<SupportedLanguage, string>;
export declare const DEFAULT_LANGUAGE: SupportedLanguage;
export declare const LANGUAGE_COOKIE_NAME = "preferredLanguage";
export interface I18nConfig {
    defaultNS?: string;
    ns?: string[];
    resources?: Record<string, Record<string, any>>;
    supportedLngs?: string[];
    defaultLanguage?: string;
}
export declare const initI18n: (config?: I18nConfig) => import("i18next").i18n;
export default i18n;
//# sourceMappingURL=i18n.d.ts.map