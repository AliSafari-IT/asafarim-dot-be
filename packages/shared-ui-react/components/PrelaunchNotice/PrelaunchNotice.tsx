import { useState, useEffect } from 'react';
import './prelaunchNotice.css';
import { isPrelaunch } from '../../configs/isPrelaunch';
import { version } from '../../configs/version';
import { Cross } from '../../svg-icons';

interface PrelaunchNoticeProps {
  storageKey?: string;
  position?: 'navbar' | 'footer';
}

export function PrelaunchNotice({ 
  storageKey = 'prelaunchNoticeDismissed',
  position = 'footer'
}: PrelaunchNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'true') setDismissed(true);
  }, [storageKey]);

  if (!isPrelaunch || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(storageKey, 'true');
  };

  const isNavbarPosition = position === 'navbar';

  return (
    <div 
      className={`prelaunch-notice ${isNavbarPosition ? 'prelaunch-notice--navbar' : 'prelaunch-notice--footer'}`}
      role="banner"
      aria-live="polite"
    >
      <div className="prelaunch-notice__container">
        <div className="prelaunch-notice__content">
          <div className="prelaunch-notice__icon" aria-hidden="true">
            {isNavbarPosition ? '🚀' : '⚠️'}
          </div>
          <div className="prelaunch-notice__text">
            {isNavbarPosition ? (
              <>
                <strong className="prelaunch-notice__title">Early Access Preview</strong>
                <span className="prelaunch-notice__message">
This is a pre-production environment.
Data entered here may be removed during updates. You’re experiencing the future — new features are rolling out daily, but some functionality may still be incomplete.                </span>
              </>
            ) : (
              <>
                <strong className="prelaunch-notice__title">Prelaunch Notice</strong>
                <span className="prelaunch-notice__message">
                  This site is publicly accessible but not yet operational. Features may change, break, or be incomplete.
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="prelaunch-notice__actions">
          <a 
            href="https://github.com/AliSafari-IT/asafarim-dot-be/issues" 
            target="_blank" 
            rel="noopener noreferrer"
            className="prelaunch-notice__link"
            aria-label="Report an issue on GitHub"
          >
            <span className="prelaunch-notice__link-icon" aria-hidden="true">🐛</span>
            Report Issue
          </a>
          
          <span className="prelaunch-notice__version" title={`Application version ${version}`}>
            v{version}
          </span>
          
          <button 
            type="button" 
            onClick={handleDismiss} 
            className="prelaunch-notice__dismiss"
            aria-label="Dismiss prelaunch notice"
            title="Dismiss this notice"
          >
            <span aria-hidden="true">
              <Cross stroke='red'/>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}