import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { initI18n } from '@asafarim/shared-i18n';
import '@asafarim/design-tokens/css';
import App from './App'
import { ThemeProvider } from '@asafarim/shared-ui-react'
import './index.css'

// Initialize i18n before rendering
initI18n();

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
)
