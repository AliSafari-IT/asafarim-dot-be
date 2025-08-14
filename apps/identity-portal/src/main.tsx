import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/auth.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import '@asafarim/react-themes/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode='light' storageKey='asafarim-theme' persistMode={true}>
      <App />
    </ThemeProvider>
  </StrictMode>,
)
