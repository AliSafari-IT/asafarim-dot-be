import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';
import { useAuth } from '../hooks/useAuth';

export const Login = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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
