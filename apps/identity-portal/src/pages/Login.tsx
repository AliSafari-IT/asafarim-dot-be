import { useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '@asafarim/shared-ui-react';

export const Login = () => {
  const { isAuthenticated, loading } = useAuth();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !loading) {
      window.location.href = returnUrl || '/dashboard';
    }
  }, [isAuthenticated, returnUrl, loading]);

  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Sign in to your account to continue"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default Login;
