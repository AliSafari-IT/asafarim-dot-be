import React from 'react';
import { AuthSyncProvider } from '@asafarim/shared-ui-react';

/**
 * Root component for Test Automation UI
 * 
 * This component wraps the application with AuthSyncProvider
 * to enable cross-app authentication synchronization.
 * 
 * Theme management is handled by the shared ThemeProvider in main.tsx
 */
interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  return (
    <AuthSyncProvider>
      {children}
    </AuthSyncProvider>
  );
}
