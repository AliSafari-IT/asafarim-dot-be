import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from '@asafarim/react-themes'
import '@asafarim/react-themes/styles.css';
import Root from './theme/Root/index.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultMode='light' storageKey='asafarim-theme' persistMode={true}>
      <Root>
        <App />
      </Root>
    </ThemeProvider>
  </StrictMode>,
)
