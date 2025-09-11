import { useEffect, useState } from 'react';
import { useToast } from '@asafarim/toast';
import './admin-components.css';
import { useNavigate } from 'react-router-dom';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5177';
        const [usersRes, rolesRes] = await Promise.all([
          fetch(`${base}/admin/users`, { credentials: 'include' }),
          fetch(`${base}/admin/roles`, { credentials: 'include' })
        ]);

        // Handle non-OK responses explicitly to avoid leaving the UI stuck on loading
        if (!usersRes.ok || !rolesRes.ok) {
          const status = !usersRes.ok ? usersRes.status : rolesRes.status;
          let message = 'Failed to load users and roles';
          if (status === 401) message = 'You are not authenticated. Please sign in.';
          if (status === 403) message = 'You are not authorized to view this page (admin role required).';
          const body = !usersRes.ok ? await usersRes.text() : await rolesRes.text();
          throw new Error(`${message}${body ? `: ${body}` : ''}`);
        }

        const usersJson = await usersRes.json();
        const rolesJson = await rolesRes.json();
        setUsers(usersJson);
        setRoles(rolesJson.map((r: { name: string }) => r.name));
      } catch (err) {
        const description = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Failed to load admin data', { description, durationMs: 6000 });
        // If unauthenticated, redirect to login and preserve return URL
        if (description.toLowerCase().includes('not authenticated')) {
          navigate(`/login?returnUrl=${encodeURIComponent('/admin/users')}`);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const saveUser = async (u: AdminUser) => {
    const res = await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5177'}/admin/users/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: u.email, userName: u.userName })
    });
    if (!res.ok) {
      const message = (await res.text()) || 'Failed to save user';
      throw new Error(message);
    }
  };

  const setUserRoles = async (u: AdminUser, nextRoles: string[]) => {
    const res = await fetch(`${import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5177'}/admin/users/${u.id}/roles`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ roles: nextRoles })
    });
    if (!res.ok) {
      const message = (await res.text()) || 'Failed to update roles';
      throw new Error(message);
    }
  };

  const persistUserFields = async (userId: string) => {
    const current = users.find(x => x.id === userId);
    if (!current) return;
    try {
      await saveUser(current);
      toast.success('User updated', {
        description: 'Profile fields saved successfully',
        durationMs: 4000
      });
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Unknown error';
      toast.error('Failed to update user', { description, durationMs: 6000 });
    }
  };

  if (loading) return <div className="admin-loading">Loading users and roles...</div>;

  return (
    <div className="container">
        {/* Premium Header */}
        <div className="hero">
          <h1 className="hero__title">Admin: User Management</h1>
          <p className="hero__subtitle">Manage all user accounts, roles, and permissions</p>
          <div className="hero__actions">
            <button 
              className="btn btn-primary" 
              onClick={() => navigate('/admin/users/add')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Add User with Null Password
            </button>
          </div>
        </div>

        {/* Table Body */}
        <div className="admin-users-body">
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Username</th>
                <th>Assigned Roles</th>
                <th>Actions</th>
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
                              try {
                                await setUserRoles(u, next);
                                toast.success('Role removed', {
                                  description: `${role} removed from user`,
                                  durationMs: 3500
                                });
                              } catch (err) {
                                const description = err instanceof Error ? err.message : 'Unknown error';
                                toast.error('Failed to update roles', { description, durationMs: 6000 });
                              }
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
                            try {
                              await setUserRoles(u, next);
                              toast.success('Role added', {
                                description: `${r} added to user`,
                                durationMs: 3500
                              });
                            } catch (err) {
                              const description = err instanceof Error ? err.message : 'Unknown error';
                              toast.error('Failed to update roles', { description, durationMs: 6000 });
                            }
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
                  <td>
                    {/* TODO: Add a button to edit the user detaileds such as name, email, phone, etc. */}
                    <button className="admin-table-button"
                      onClick={() => {
                        // TODO: Take the current user and pass it to the UserProfile component
                        navigate(`/admin/user-profile/${u.id}`);
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="admin-table-button-icon">
                        <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
  );
}


