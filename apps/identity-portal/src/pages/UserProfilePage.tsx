// UserProfilePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../hooks/useAuth';

export const UserProfilePage = () => {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate(returnUrl || '/login');
    }
  }, [isAuthenticated, navigate, returnUrl, loading]);

  return (
    <div data-testid="user-profile-page">
      <AuthLayout>
        <UserProfile />
      </AuthLayout>
    </div>
  );
};

export default UserProfilePage;
