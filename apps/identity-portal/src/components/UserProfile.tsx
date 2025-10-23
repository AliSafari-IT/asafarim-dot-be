import { useEffect, useState } from 'react';
import './admin-components.css';
import { useAuth } from '../hooks/useAuth';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@asafarim/toast';
import { ArrowLeftIcon, ButtonComponent } from '@asafarim/shared-ui-react';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

const API = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';

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
      try {
        const [uRes, rRes] = await Promise.all([
          fetch(`${API}/admin/users`, { credentials: 'include' }),
          fetch(`${API}/admin/roles`, { credentials: 'include' }),
        ]);
        
        if (!uRes.ok || !rRes.ok) {
          const errorStatus = !uRes.ok ? uRes.status : rRes.status;
          const errorText = !uRes.ok ? await uRes.text() : await rRes.text();
          throw new Error(`API error (${errorStatus}): ${errorText}`);
        }
        
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
          // If we have a route user ID, strictly use that and don't fall back
          // Try to find by ID first
          current = filteredUsers.find(x => x.id === routeUserId);
          
          // If not found by ID, try to find by email (for cases where ID might be an email)
          if (!current) {
            current = filteredUsers.find(x => x.email === routeUserId);
          }
          
          // If still not found, try case-insensitive email comparison
          if (!current && routeUserId.includes('@')) {
            const lowerCaseEmail = routeUserId.toLowerCase();
            current = filteredUsers.find(x => x.email?.toLowerCase() === lowerCaseEmail);
          }
          
          // If we can't find the user with the given ID, show an error
          if (!current) {
            console.error(`User not found with ID or email: ${routeUserId}`);
            console.log('Available users:', filteredUsers);
            toast.error('User not found', { 
              description: `Could not find user with ID or email: ${routeUserId}`, 
              durationMs: 5000 
            });
            // Navigate back to users list
            navigate('/admin/users');
            return;
          }
        } else {
          // No route ID, so use current user or first in list
          current = filteredUsers.find(x => x.email === user?.email || x.id === user?.id) || filteredUsers[0];
        }
        
        if (current) selectUser(current);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading user data';
        console.error('Error loading user profile:', errorMessage);
        toast.error('Failed to load user data', {
          description: errorMessage,
          durationMs: 5000
        });
        navigate('/admin/users');
      }
    };
    void load();
  }, [user, routeUserId, toast, navigate]);

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

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">

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
              <ButtonComponent 
                onClick={() => navigate('/dashboard')}
                variant="link"
                size="md"
                leftIcon={<ArrowLeftIcon width={28} height={28} />}
              >
                Cancel and Return to Dashboard
              </ButtonComponent>
              <ButtonComponent 
                variant="info"
                size="md"
                disabled={busy || !selectedId} 
                onClick={save}
              >
                {busy ? 'Saving Changes...' : 'Save Changes'}
              </ButtonComponent>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


