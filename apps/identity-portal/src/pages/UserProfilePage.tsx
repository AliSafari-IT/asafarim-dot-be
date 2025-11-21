// UserProfilePage.tsx

import AuthLayout from '../components/AuthLayout';
import UserProfile from '../components/UserProfile';

export const UserProfilePage = () => {
  return (
    <div data-testid="user-profile-page">
      <AuthLayout>
        <UserProfile />
      </AuthLayout>
    </div>
  );
};

export default UserProfilePage;
