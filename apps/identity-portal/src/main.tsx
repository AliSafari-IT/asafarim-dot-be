import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import { initI18n } from '@asafarim/shared-i18n'
import Root from './theme/Root'
import enAdminArea from './locales/admin-area-en.json'
import nlAdminArea from './locales/admin-area-nl.json'
// Initialize i18n before rendering
// Initialize i18n before rendering
initI18n({
  defaultNS: 'common',
  ns: ["adminArea"],
  supportedLngs: ['en', 'nl'],
  defaultLanguage: 'en',
  resources: {
    en: {
      adminArea: enAdminArea
    },
    nl: {
      adminArea: nlAdminArea
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode="dark" storageKey='asafarim-theme'>
      <Root>
        <App />
      </Root>
    </ThemeProvider>
  </StrictMode>,
)
