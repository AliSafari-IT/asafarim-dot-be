import { ThemeToggle } from '@asafarim/react-themes';
import { useAuth } from '../hooks/useAuth';
import identityService from '../api/identityService';
import { useState } from 'react';
import '../css/dashboard.css';
import { useEffect } from 'react';

export const Dashboard = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    await logout();
    // Redirect will happen via protected route
  };

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = 'http://identity.asafarim.local:5177/login';
    }
  }, [isAuthenticated]);

  return (
    <div className="identity-dashboard-container">
      <header className="identity-dashboard-header">
        <div className="identity-dashboard-logo">
          <img src="/logo.svg" alt="ASafariM Logo" width="32" height="32" />
          <h1 className="identity-dashboard-logo-text">ASafariM Identity</h1>
        </div>
        <div className="identity-dashboard-actions" style={{ display: 'flex', alignItems: 'center' }}>
          <button onClick={handleLogout} className="identity-btn-logout" style={{ border: 'none', backgroundColor: 'transparent' }}>
            Sign Out
          </button>
          <ThemeToggle size='lg' style={{ border: 'none', backgroundColor: 'transparent', marginLeft: '10px' }} />
        </div>
      </header>

      <main className="identity-dashboard-content">
        <div className="identity-dashboard-card">
          <h2 className="identity-dashboard-title">Welcome, {user?.firstName || user?.email}</h2>

          <div className="identity-profile-section">
            <h3 className="identity-profile-section-title">Your Profile</h3>
            <div className="identity-profile-info">
              <div className="identity-info-group">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>

              {user?.firstName && (
                <div className="identity-info-group">
                  <label>First Name</label>
                  <p>{user.firstName}</p>
                </div>
              )}

              {user?.lastName && (
                <div className="identity-info-group">
                  <label>Last Name</label>
                  <p>{user.lastName}</p>
                </div>
              )}

              <div className="info-group">
                <label>Roles</label>
                <p>{user?.roles?.join(', ') || 'User'}</p>
              </div>
            </div>
          </div>

          <div className="identity-actions-section">
            <h3 className="identity-actions-section-title">Account Actions</h3>
            <div className="identity-action-buttons">
              <button
                className="identity-btn-secondary"
                disabled={busy}
                onClick={async () => {
                  const email = prompt('New email', user?.email ?? '');
                  if (email === null) return;
                  setBusy(true);
                  try {
                    await identityService.updateProfile({ email });
                    window.location.reload();
                  } finally { setBusy(false); }
                }}
              >
                Edit Profile
              </button>
              <button
                className="identity-btn-secondary"
                disabled={busy}
                onClick={async () => {
                  const currentPassword = prompt('Current password') ?? '';
                  const newPassword = prompt('New password') ?? '';
                  const confirmPassword = prompt('Confirm new password') ?? '';
                  if (!currentPassword || !newPassword) return;
                  setBusy(true);
                  try {
                    await identityService.changePassword({ currentPassword, newPassword, confirmPassword });
                    alert('Password changed successfully');
                  } catch (e:any) {
                    alert(e?.message ?? 'Failed to change password');
                  } finally { setBusy(false); }
                }}
              >
                Change Password
              </button>
              {/* Click to go to blog app */}
              <button className="identity-btn-secondary" onClick={() => window.open('http://blog.asafarim.local:3000', '_blank')}>Blog</button>
              {/* Click to go to web app in new tab */}
              <button className="identity-btn-secondary" onClick={() => window.open('http://web.asafarim.local:5175', '_blank')}>Web App</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
