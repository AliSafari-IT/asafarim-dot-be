import { useLanguage, LANGUAGE_NAMES } from '@asafarim/shared-i18n';
import type { SupportedLanguage } from '@asafarim/shared-i18n';

export default function LanguageSwitcher() {
  const { language, changeLanguage, isChanging } = useLanguage();

  const handleChange = (lang: SupportedLanguage) => {
    if (lang !== language) {
      changeLanguage(lang);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      {Object.entries(LANGUAGE_NAMES).map(([lang, name]) => (
        <button
          key={lang}
          onClick={() => handleChange(lang as SupportedLanguage)}
          disabled={isChanging}
          className={`btn ${language === lang ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
