import { useState, useEffect } from 'react';
import './prelaunchNotice.css';
import { isPrelaunch } from '../../configs/isPrelaunch';
import { version } from '../../configs/version';

export function PrelaunchNotice() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('prelaunchDismissed');
    if (stored === 'true') setDismissed(true);
  }, []);

  if (!isPrelaunch || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('prelaunchDismissed', 'true');
  };

  return (
    <div className="prelaunch-notice">
      ⚠️ This site is publicly accessible but not yet operational. Features may change, break, or be incomplete.
      <button type='button' onClick={handleDismiss} className="dismiss-button" aria-label="Dismiss notice">Dismiss</button>
      <div className="feedback-link">
        Feedback? <a href="https://github.com/AliSafari-IT/asafarim-dot-be/issues" target="_blank" rel="noopener noreferrer">Report an issue</a>
      </div>
      <div className="version-number">Version: {version}</div>
    </div>
  );
}