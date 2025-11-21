import AuthLayout from '../components/AuthLayout';
import MeProfile from '../components/MeProfile';

export default function MeProfilePage() {
  return (
    <div data-testid="me-profile-page">
      <AuthLayout>
        <MeProfile />
      </AuthLayout>
    </div>
  );
}


