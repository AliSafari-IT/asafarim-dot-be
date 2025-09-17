import { useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import LoginHero from '../components/LoginHero';

export const Login = () => {
  const { isAuthenticated, isLoading, passwordSetupRequired } = useAuth();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading && !passwordSetupRequired) {
      window.location.href = returnUrl || '/dashboard';
    }
  }, [isAuthenticated, returnUrl, isLoading, passwordSetupRequired]);

  return (
    <LoginHero 
      passwordSetupRequired={passwordSetupRequired}
      returnUrl={returnUrl}
    />
  );
};

export default Login;
