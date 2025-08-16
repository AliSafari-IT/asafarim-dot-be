import { useEffect, useState } from 'react';
import './admin-components.css';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

const API = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190';

export default function UserProfile() {
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
      setUsers(u);
      setRoles(r.map((x: { name: string }) => x.name));
      if (u.length) selectUser(u[0]);
    };
    void load();
  }, []);

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
      await fetch(`${API}/admin/users/${selectedId}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roles: userRoles }),
      });
      alert('User updated');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        {/* Premium Header */}
        <div className="admin-form-header">
          <h1 className="admin-form-title">Admin: User Profile</h1>
          <p className="admin-form-subtitle">Manage individual user accounts and permissions</p>
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


