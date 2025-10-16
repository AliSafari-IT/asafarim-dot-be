import { type ReactNode, useEffect } from 'react';
import { useAuth } from '@asafarim/shared-ui-react';

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Protected route component that handles authentication redirects for admin pages
 * 
 * This component:
 * - Shows loading state while checking authentication
 * - Redirects to identity portal login if not authenticated
 * - Renders children only when authenticated
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, signIn } = useAuth();
  
  useEffect(() => {
    // Only redirect after loading completes and user is not authenticated
    if (!loading && !isAuthenticated) {
      console.log('[ProtectedRoute] Not authenticated, redirecting to login');
      signIn(window.location.href);
    }
  }, [loading, isAuthenticated, signIn]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Checking authentication...</p>
      </div>
    );
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  // Render children only when authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
