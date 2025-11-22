import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initI18n } from '@asafarim/shared-i18n';
import App from './App';
import './index.css';

// Import demo-specific translations
import enDemo from './locales/en/demo.json';
import nlDemo from './locales/nl/demo.json';

// Initialize i18n with demo translations
initI18n({
  defaultNS: 'common',
  ns: ['common', 'demo'],
  resources: {
    en: { demo: enDemo },
    nl: { demo: nlDemo }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
