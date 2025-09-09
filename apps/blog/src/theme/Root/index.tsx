import React, { useEffect, useState } from 'react';
import { ThemeProvider } from '@asafarim/react-themes';
import { AuthSyncProvider } from '@asafarim/shared-ui-react';

/**
 * Custom Root component for Docusaurus
 * 
 * This component wraps the entire application with ThemeProvider and AuthSyncProvider
 * to enable theming and cross-app authentication synchronization.
 * 
 * Docusaurus will automatically use this component as the root wrapper
 * for the entire application when placed in src/theme/Root.
 */
interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  // Get initial theme from localStorage or cookie
  const [initialTheme, setInitialTheme] = useState<'dark' | 'light'>('dark');
  
  useEffect(() => {
    // Function to get cookie value
    const getCookie = (name: string): string | null => {
      const match = document.cookie.match(new RegExp('(?:^|; )' + name + '=([^;]*)'));
      return match ? decodeURIComponent(match[1]) : null;
    };
    
    // Get theme from various sources
    const cookieTheme = getCookie('asafarim_theme');
    const localTheme = localStorage.getItem('asafarim-theme') || 
                      localStorage.getItem('theme') || 
                      localStorage.getItem('docusaurus.theme.lastTheme');
    
    // Use cookie theme first, then localStorage, default to dark
    const theme = (cookieTheme === 'light' || cookieTheme === 'dark') ? cookieTheme : 
                 (localTheme === 'light' || localTheme === 'dark') ? localTheme : 
                 'dark';
    
    setInitialTheme(theme as 'dark' | 'light');
    
    // Set all theme keys for consistency
    if (theme === 'light' || theme === 'dark') {
      localStorage.setItem('asafarim-theme', theme);
      localStorage.setItem('theme', theme);
      localStorage.setItem('docusaurus.theme.lastTheme', theme);
    }
  }, []);
  
  return (
    <ThemeProvider defaultMode={initialTheme} storageKey="asafarim-theme" persistMode={true}>
      <AuthSyncProvider>
        {children}
      </AuthSyncProvider>
    </ThemeProvider>
  );
}
