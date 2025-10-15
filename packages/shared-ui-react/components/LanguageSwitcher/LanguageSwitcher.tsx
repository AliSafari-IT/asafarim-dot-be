import React, { useState } from 'react';
import { useLanguage, LANGUAGE_NAMES, type SupportedLanguage } from '@asafarim/shared-i18n';
import './LanguageSwitcher.css';

export interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'toggle' | 'creative';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'toggle',
  className = ''
}) => {
  const { language, changeLanguage, isChanging } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = async (lang: SupportedLanguage) => {
    if (lang !== language) {
      await changeLanguage(lang);
      setIsOpen(false);
    }
  };

  if (variant === 'creative') {
    return (
      <div className={`language-switcher-creative ${className}`}>
        <div className="relative">
          <button
            className={`language-globe-button ${isChanging ? 'changing' : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            disabled={isChanging}
            aria-label={`Current language: ${LANGUAGE_NAMES[language]}`}
            title={`Current language: ${LANGUAGE_NAMES[language]}`}
          >
            <div className="globe-icon">
              <div className="continent continent-1"></div>
              <div className="continent continent-2"></div>
              <div className="continent continent-3"></div>
            </div>
            <div className="language-indicator">
              {language === 'en' ? 'EN' : 'NL'}
            </div>
          </button>

          {isOpen && (
            <div className="language-dropdown">
              <div className="dropdown-arrow"></div>
              <div className="dropdown-content">
                {Object.entries(LANGUAGE_NAMES).map(([code, name]) => (
                  <button
                    key={code}
                    className={`language-option ${language === code ? 'active' : ''}`}
                    onClick={() => handleLanguageChange(code as SupportedLanguage)}
                    disabled={isChanging}
                    title={`Switch to ${name}`}
                  >
                    <span className="option-icon">
                      {code === 'en' ? '🇺🇸' : '🇳🇱'}
                    </span>
                    <span className="option-text">{name}</span>
                    {language === code && (
                      <span className="check-icon">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'toggle') {
    return (
      <button
        className={`language-globe-button language-switcher-toggle ${className}`}
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
