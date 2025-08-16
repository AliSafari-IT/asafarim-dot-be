import { useEffect, useState } from 'react';
import './admin-components.css';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [usersRes, rolesRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190'}/admin/users`, { credentials: 'include' }),
        fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190'}/admin/roles`, { credentials: 'include' })
      ]);
      const usersJson = await usersRes.json();
      const rolesJson = await rolesRes.json();
      setUsers(usersJson);
      setRoles(rolesJson.map((r: { name: string }) => r.name));
      setLoading(false);
    };
    load();
  }, []);

  const saveUser = async (u: AdminUser) => {
    await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190'}/admin/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: u.email, userName: u.userName })
    });
  };

  const setUserRoles = async (u: AdminUser, nextRoles: string[]) => {
    await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5190'}/admin/users/${u.id}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roles: nextRoles })
    });
  };

  const persistUserFields = async (userId: string) => {
    const current = users.find(x => x.id === userId);
    if (!current) return;
    await saveUser(current);
  };

  if (loading) return <div className="admin-loading">Loading users and roles...</div>;

  return (
    <div className="admin-users-container">
      <div className="admin-users-card">
        {/* Premium Header */}
        <div className="admin-users-header">
          <h1 className="admin-users-title">Admin: User Management</h1>
          <p className="admin-users-subtitle">Manage all user accounts, roles, and permissions</p>
        </div>

        {/* Table Body */}
        <div className="admin-users-body">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Username</th>
                <th>Assigned Roles</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <input
                      className="admin-table-input"
                      type="email"
                      value={u.email || ''}
                      onChange={e => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, email: e.target.value } : x))}
                      onBlur={() => { void persistUserFields(u.id); }}
                      placeholder="Enter email"
                    />
                  </td>
                  <td>
                    <input
                      className="admin-table-input"
                      type="text"
                      value={u.userName || ''}
                      onChange={e => setUsers(prev => prev.map(x => x.id === u.id ? { ...x, userName: e.target.value } : x))}
                      onBlur={() => { void persistUserFields(u.id); }}
                      placeholder="Enter username"
                    />
                  </td>
                  <td>
                    <div className="role-tags-container">
                      {u.roles.map(role => (
                        <span key={role} className="role-tag">
                          <button
                            className="role-tag-remove"
                            onClick={async () => {
                              const next = u.roles.filter(r => r !== role);
                              setUsers(prev => prev.map(x => x.id === u.id ? { ...x, roles: next } : x));
                              await setUserRoles(u, next);
                            }}
                            aria-label={`Remove ${role} role`}
                            title={`Remove ${role} role`}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          {role}
                        </span>
                      ))}
                    </div>
                    {/* Available roles list (unselected) */}
                    <div className="available-roles-container">
                      {roles.filter(r => !u.roles.includes(r)).map(r => (
                        <button
                          key={r}
                          className="role-chip"
                          onClick={async () => {
                            const next = Array.from(new Set([...u.roles, r]));
                            setUsers(prev => prev.map(x => x.id === u.id ? { ...x, roles: next } : x));
                            await setUserRoles(u, next);
                          }}
                          aria-label={`Add ${r} role`}
                          title={`Add ${r} role`}
                        >
                          <span className="role-chip-add" aria-hidden>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </span>
                          {r}
                        </button>
                      ))}
                      {roles.filter(r => !u.roles.includes(r)).length === 0 && (
                        <span className="available-roles-empty">All roles assigned</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


