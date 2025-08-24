import AuthLayout from '../components/AuthLayout';
import MeProfile from '../components/MeProfile';

export default function MeProfilePage() {
  return (
    <AuthLayout
      title="My Profile"
      subtitle="Manage your profile"
    >
      <MeProfile />
    </AuthLayout>
  );
}


