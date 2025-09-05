import React, { useEffect } from 'react';
import { setupAuthSyncListener } from '../../utils/authSync';
import { useAuth } from '../../hooks/useAuth';

/**
 * AuthSyncProvider component
 * 
 * This component sets up listeners for authentication synchronization
 * across different applications in the ASafariM ecosystem.
 * It handles sign-out events from other apps like identity-portal.
 */
export default function AuthSyncProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const { forceSignOut } = useAuth();

  useEffect(() => {
    // Set up auth sync listener for cross-app auth events
    const cleanup = setupAuthSyncListener(() => {
      console.log('Sign-out detected from another app');
      
      // Force local auth state to be cleared
      forceSignOut();
      
      // For protected routes, redirect to login
      const isProtectedRoute = window.location.pathname.includes('/dashboard') || 
                              window.location.pathname.includes('/admin') || 
                              window.location.pathname.includes('/me');
      
      if (isProtectedRoute) {
        window.location.href = '/login';
      } else {
        // Just refresh the page to update UI state
        window.location.reload();
      }
    });
    
    // Clean up listener when component unmounts
    return cleanup;
  }, [forceSignOut]);
  
  // Simply render children - this is a context provider with no UI
  return <>{children}</>;
}
