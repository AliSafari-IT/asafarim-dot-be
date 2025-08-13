import { useAuth } from '../hooks/useAuth';

export const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirect will happen via protected route
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-logo">
          <img src="/logo.svg" alt="ASafariM Logo" width="32" height="32" />
          <h1>ASafariM Identity</h1>
        </div>
        <button onClick={handleLogout} className="btn-logout">
          Sign Out
        </button>
      </header>

      <main className="dashboard-content">
        <div className="dashboard-card">
          <h2 className="dashboard-title">Welcome, {user?.firstName || user?.email}</h2>
          
          <div className="profile-section">
            <h3>Your Profile</h3>
            <div className="profile-info">
              <div className="info-group">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              
              {user?.firstName && (
                <div className="info-group">
                  <label>First Name</label>
                  <p>{user.firstName}</p>
                </div>
              )}
              
              {user?.lastName && (
                <div className="info-group">
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
          
          <div className="actions-section">
            <h3>Account Actions</h3>
            <div className="action-buttons">
              <button className="btn-secondary">Edit Profile</button>
              <button className="btn-secondary">Change Password</button>
              {/* Click to go to blog app */}
              <button className="btn-secondary" onClick={() => window.location.href = 'http://blog.asafarim.local:3000'}>Blog</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
