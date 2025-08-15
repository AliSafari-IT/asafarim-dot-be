import { useEffect, useMemo, useState } from 'react';
import identityService from '../api/identityService';

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
      setRoles(rolesJson.map((r: any) => r.name));
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

  if (loading) return <div className="identity-dashboard-content">Loading...</div>;

  return (
    <div className="identity-dashboard-content">
      <div className="identity-dashboard-card">
        <h2 className="identity-dashboard-title">Admin: Users</h2>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Username</th>
              <th style={{ textAlign: 'left', padding: '8px' }}>Roles</th>
              <th style={{ padding: '8px' }}></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td style={{ padding: '8px' }}>
                  <input value={u.email || ''} onChange={e => setUsers(prev => prev.map(x => x.id===u.id? { ...x, email: e.target.value }: x))} />
                </td>
                <td style={{ padding: '8px' }}>
                  <input value={u.userName || ''} onChange={e => setUsers(prev => prev.map(x => x.id===u.id? { ...x, userName: e.target.value }: x))} />
                </td>
                <td style={{ padding: '8px' }}>
                  <select multiple value={u.roles} onChange={e => {
                    const selected = Array.from(e.target.selectedOptions).map(o => o.value);
                    setUsers(prev => prev.map(x => x.id===u.id? { ...x, roles: selected }: x));
                  }}>
                    {roles.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td style={{ padding: '8px' }}>
                  <button className="identity-btn-secondary" onClick={async () => { await saveUser(u); await setUserRoles(u, u.roles); alert('Saved'); }}>Save</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


