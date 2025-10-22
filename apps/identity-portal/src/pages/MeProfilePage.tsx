import AuthLayout from '../components/AuthLayout';
import MeProfile from '../components/MeProfile';

export default function MeProfilePage() {
  return (
    <AuthLayout
      key={'identity-portal-me-profile'}
    >
      <MeProfile />
    </AuthLayout>
  );
}


