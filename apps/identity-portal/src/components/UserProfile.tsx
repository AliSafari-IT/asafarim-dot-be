import { useEffect, useState } from 'react';
import './admin-components.css';
import { useAuth } from '../hooks/useAuth';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

const API = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190';

export default function UserProfile() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

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

      // Default select current user if available, otherwise first in list
      const current = filteredUsers.find(x => x.email === user?.email || x.id === user?.id) || filteredUsers[0];
      if (current) selectUser(current);
    };
    void load();
  }, [user]);

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
      alert('User updated');
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
          <div className="admin-form-grid">
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

            <div className="admin-form-group">
              <label className="admin-form-label">User Roles</label>
              <select
                className="admin-form-select"
                multiple
                value={userRoles}
                onChange={e => setUserRoles(Array.from(e.target.selectedOptions).map(o => o.value))}
                disabled={(user?.roles || []).includes('Admin') ? false : true}
              >
                {roles.map(r => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-form-group">
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


