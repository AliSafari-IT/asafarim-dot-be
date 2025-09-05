import React from 'react';
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
  return (
    <ThemeProvider>
      <AuthSyncProvider>
        {children}
      </AuthSyncProvider>
    </ThemeProvider>
  );
}
