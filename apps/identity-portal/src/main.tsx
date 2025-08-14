import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './css/auth.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import '@asafarim/react-themes/styles.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme='light'>
    <App />
    </ThemeProvider>
  </StrictMode>,
)
