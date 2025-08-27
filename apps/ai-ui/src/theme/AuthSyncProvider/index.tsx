import React, { useEffect } from 'react';
import { setupAuthSyncListener } from '../../utils/authSync';

/**
 * AuthSyncProvider component
 * 
 * This component sets up listeners for authentication synchronization
 * across different applications in the ASafariM ecosystem.
 * It handles sign-out events from other apps like identity-portal.
 */
export default function AuthSyncProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  useEffect(() => {
    // Set up auth sync listener
    const cleanup = setupAuthSyncListener(() => {
      // Handle sign-out event from other apps
      console.log('Sign-out detected from another app');
      
      // You can add additional logic here if needed
      // For example, showing a notification or redirecting
      
      // If you need to refresh the page to update UI state
      window.location.reload();
    });
    
    // Clean up listener when component unmounts
    return cleanup;
  }, []);
  
  // Simply render children - this is a context provider with no UI
  return <>{children}</>;
}
