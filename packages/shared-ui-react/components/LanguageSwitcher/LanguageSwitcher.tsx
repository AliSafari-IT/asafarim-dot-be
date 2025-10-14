import React from 'react';
import { useLanguage, LANGUAGE_NAMES, SupportedLanguage } from '@asafarim/shared-i18n';
import './LanguageSwitcher.css';

export interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'dropdown',
  className = '' 
}) => {
  const { language, changeLanguage, isChanging } = useLanguage();

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    if (lang !== language) {
      await changeLanguage(lang);
    }
  };

  if (variant === 'toggle') {
    return (
      <button
        className={`language-switcher-toggle ${className}`}
        onClick={() => handleLanguageChange(language === 'en' ? 'nl' : 'en')}
        disabled={isChanging}
        aria-label="Switch language"
        title={`Switch to ${language === 'en' ? 'Nederlands' : 'English'}`}
      >
        <span className="language-code">{language === 'en' ? 'NL' : 'EN'}</span>
      </button>
    );
  }

  return (
    <div className={`language-switcher ${className}`}>
      <select
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value as SupportedLanguage)}
        disabled={isChanging}
        className="language-select"
        aria-label="Select language"
      >
        {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
          <option key={code} value={code}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
};
