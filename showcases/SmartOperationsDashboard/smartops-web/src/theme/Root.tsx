import React, { useEffect, useMemo, useState } from 'react';
import { ThemeProvider } from '@asafarim/react-themes';
import { AuthSyncProvider } from '@asafarim/shared-ui-react';

/**
 * Root component for Web app
 * 
 * This component wraps the entire application with ThemeProvider and AuthSyncProvider
 * to enable theming and cross-app authentication synchronization.
 * 
 * Matches the working pattern from the blog app.
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
    <ThemeProvider config={useMemo(() => ({
      storageKey: 'asafarim-theme',
      // Only set defaultMode when known; otherwise fall back to provider default ('system')
      ...(initialTheme ? { defaultMode: initialTheme } : {}),
    }), [initialTheme])}>
      <AuthSyncProvider>
        {children}
      </AuthSyncProvider>
    </ThemeProvider>
  );
}
