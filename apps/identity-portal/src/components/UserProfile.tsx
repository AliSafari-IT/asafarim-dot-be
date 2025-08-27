import { useEffect, useState } from 'react';
import './admin-components.css';
import { useAuth } from '../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@asafarim/toast';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

const API = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190';

export default function UserProfile() {
  const { user } = useAuth();
  const { id: routeUserId } = useParams<{ id?: string }>();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      const [uRes, rRes] = await Promise.all([
        fetch(`${API}/admin/users`, { credentials: 'include' }),
        fetch(`${API}/admin/roles`, { credentials: 'include' }),
      ]);
      const u = await uRes.json();
      const r = await rRes.json();
      const allUsers: AdminUser[] = u;

      // If not admin, restrict the list to the current user only
      const isAdmin = (user?.roles || []).includes('Admin');
      const filteredUsers = isAdmin ? allUsers : allUsers.filter(x => x.email === user?.email || x.id === user?.id);

      setUsers(filteredUsers);
      setRoles(r.map((x: { name: string }) => x.name));

      // Select by route param if provided (admin flow), otherwise current user, otherwise first
      let current: AdminUser | undefined;
      if (routeUserId) {
        current = filteredUsers.find(x => x.id === routeUserId);
      }
      if (!current) {
        current = filteredUsers.find(x => x.email === user?.email || x.id === user?.id) || filteredUsers[0];
      }
      if (current) selectUser(current);
    };
    void load();
  }, [user, routeUserId]);

  const selectUser = (u: AdminUser) => {
    setSelectedId(u.id);
    setEmail(u.email || '');
    setUserName(u.userName || '');
    setUserRoles(u.roles || []);
  };

  // const currentUser = useMemo(() => users.find(x => x.id === selectedId) || null, [users, selectedId]);

  const save = async () => {
    if (!selectedId) return;
    setBusy(true);
    try {
      await fetch(`${API}/admin/users/${selectedId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, userName }),
      });
      // Only admins can change roles. If non-admin, skip roles update.
      const isAdmin = (user?.roles || []).includes('Admin');
      if (isAdmin) {
        await fetch(`${API}/admin/users/${selectedId}/roles`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ roles: userRoles }),
        });
      }
      toast.success('User updated successfully', {
        description: 'Profile information has been saved',
        durationMs: 4000
      });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to update user', { 
        description, 
        durationMs: 6000 
      });
    } finally {
      setBusy(false);
    }
  };

  const isAdmin = (user?.roles || []).includes('Admin');

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        {/* Premium Header */}
        <div className="admin-form-header">
          <h1 className="admin-form-title">{isAdmin ? 'Admin: User Profile' : 'My Profile'}</h1>
          <p className="admin-form-subtitle">{isAdmin ? 'Manage individual user accounts and permissions' : 'Update your personal information'}</p>
        </div>

        {/* Form Body */}
        <div className="admin-form-body">
          <div className="admin-form-grid admin-form-grid-improved">
            <div className="admin-form-group">
              <label className="admin-form-label">Select User</label>
              <select
                className="admin-form-select"
                value={selectedId}
                onChange={e => {
                  const u = users.find(x => x.id === e.target.value);
                  if (u) selectUser(u);
                }}
                disabled={(user?.roles || []).includes('Admin') ? false : true}
              >
                {users.map(u => (
                  <option key={u.id} value={u.id}>
                    {u.email || u.userName || u.id}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Email Address</label>
              <input 
                className="admin-form-input"
                type="email"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Enter email address"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-form-label">Username</label>
              <input 
                className="admin-form-input"
                type="text"
                value={userName} 
                onChange={e => setUserName(e.target.value)} 
                placeholder="Enter username"
              />
            </div>

            <div className="admin-form-group admin-roles-section">
              <label className="admin-form-label">User Roles</label>
              <div className="admin-roles-grid">
                {roles.map(role => (
                  <label key={role} className="admin-role-checkbox-item">
                    <input
                      type="checkbox"
                      className="admin-role-checkbox"
                      checked={userRoles.includes(role)}
                      onChange={e => {
                        if (e.target.checked) {
                          setUserRoles([...userRoles, role]);
                        } else {
                          setUserRoles(userRoles.filter(r => r !== role));
                        }
                      }}
                      disabled={!(user?.roles || []).includes('Admin')}
                    />
                    <span className="admin-role-checkbox-label">{role}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-form-actions">
              <button className="admin-cancel-button" onClick={() => navigate('/dashboard')}>
                Cancel and Return to Dashboard
              </button>
              <button 
                className="admin-save-button" 
                disabled={busy || !selectedId} 
                onClick={save}
              >
                {busy ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


