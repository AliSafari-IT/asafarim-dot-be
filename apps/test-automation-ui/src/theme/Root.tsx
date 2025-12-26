import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@asafarim/react-themes';
import { AuthSyncProvider } from '@asafarim/shared-ui-react';

/**
 * Root component for Test Automation UI: Testora
 * 
 * This component wraps the application with AuthSyncProvider
 * to enable cross-app authentication synchronization.
 * 
 * Theme management is handled by the shared ThemeProvider
 */
interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  // Get initial theme from localStorage or cookie
  const [initialTheme, setInitialTheme] = useState<'dark' | 'light'>();
  
  useEffect(() => {
    // Function to get cookie value
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };
    
    // Get theme from various sources
    const cookieTheme = getCookie('asafarim_theme');
    const localTheme = localStorage.getItem('asafarim-theme') || 
                      localStorage.getItem('theme');
    
    // Use cookie theme first, then localStorage, default to dark
    const theme = (cookieTheme === 'light' || cookieTheme === 'dark') ? cookieTheme : 
                 (localTheme === 'light' || localTheme === 'dark') ? localTheme : 
                 'dark';
    
    setInitialTheme(theme as 'dark' | 'light');
    
    // Set theme keys for consistency
    if (theme === 'light' || theme === 'dark') {
      localStorage.setItem('asafarim-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, []);
  
  return (
    <ThemeProvider config={{ defaultMode: initialTheme, storageKey: 'asafarim-theme' }}>
      <AuthSyncProvider>
        {children}
      </AuthSyncProvider>
    </ThemeProvider>
  );
}
