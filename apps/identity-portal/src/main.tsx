import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import { initI18n } from '@asafarim/shared-i18n'
import Root from './theme/Root/index.tsx'

// Initialize i18n before rendering
initI18n();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider config={{defaultMode: 'light', storageKey: 'asafarim-theme'}}>
      <Root>
        <App />
      </Root>
    </ThemeProvider>
  </StrictMode>,
)
