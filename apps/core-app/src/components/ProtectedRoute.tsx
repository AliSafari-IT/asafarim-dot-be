import React from 'react';
import { useAuth, ButtonComponent, Card, CardContent as CardBody, CardHeader, isProduction } from '@asafarim/shared-ui-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading, signIn } = useAuth();
  const returnTo = isProduction ? 'https://core.asafarim.be/jobs' : 'http://asafarim.local:5173/jobs';
  

  if (loading) return null;

  if (!isAuthenticated) {
    return (
      <div style={{
        maxWidth: 640,
        margin: '2rem auto',
        padding: '0 1rem',
      }}>
        <Card>
          <CardHeader>
            <h2 style={{ margin: 0 }}>Sign in required</h2>
          </CardHeader>
          <CardBody>
            <p style={{ margin: '0 0 1rem 0', color: 'var(--color-text-muted)' }}>
              You need to be signed in to access this page. Please sign in to continue.
            </p>
            <ButtonComponent variant="brand" onClick={() => signIn?.(returnTo)}>
              Sign in
            </ButtonComponent>
          </CardBody>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
