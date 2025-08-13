import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import RegisterForm from '../components/RegisterForm';
import { useAuth } from '../hooks/useAuth';

export const Register = () => {
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
      title="Create Account" 
      subtitle="Sign up to get started with ASafariM"
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default Register;
