import { useEffect } from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import PasswordSetupForm from '../components/PasswordSetupForm';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const { isAuthenticated, isLoading, passwordSetupRequired } = useAuth();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !passwordSetupRequired) {
      window.location.href = returnUrl || '/dashboard';
    }
  }, [isAuthenticated, returnUrl, isLoading, passwordSetupRequired]);

  // Show password setup form if required
  if (passwordSetupRequired) {
    return (
      <AuthLayout 
        title="Set Your Password" 
        subtitle="Please create a password for your account"
      >
        <PasswordSetupForm 
          userId={passwordSetupRequired.userId}
          email={passwordSetupRequired.email}
          onSuccess={() => {
            window.location.href = returnUrl || '/dashboard';
          }}
          onCancel={() => {
            // Go back to login form
            window.location.reload();
          }}
        />
      </AuthLayout>
    );
  }

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
