// UserProfilePage.tsx

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import UserProfile from '../components/UserProfile';
import { useAuth } from '../hooks/useAuth';

export const UserProfilePage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
  
  // Redirect unauthenticated users to login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate(returnUrl || '/login');
    }
  }, [isAuthenticated, navigate, returnUrl]);

  return (
    <AuthLayout 
      title={(user?.roles || []).includes('Admin') ? 'Admin: User Profile' : 'My Profile'} 
      subtitle={(user?.roles || []).includes('Admin') ? 'Manage individual user accounts and permissions' : 'Manage your profile'}
    >
      <UserProfile />
    </AuthLayout>
  );
};

export default UserProfilePage;
