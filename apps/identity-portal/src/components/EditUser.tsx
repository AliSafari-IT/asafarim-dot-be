import { useEffect, useState } from 'react';
import './admin-components.css';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@asafarim/toast';
import { Eye, EyeOff } from '@asafarim/shared-ui-react';

type AdminUser = { id: string; email?: string; userName?: string; roles: string[] };

const API = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';

export default function EditUser() {
  const { id: userId } = useParams<{ id: string }>();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUser = async () => {
      setLoading(true);
      try {
        // Load roles first
        const rolesRes = await fetch(`${API}/admin/roles`, { credentials: 'include' });
        if (!rolesRes.ok) {
          throw new Error(`Failed to load roles: ${rolesRes.status} ${await rolesRes.text()}`);
        }
        const rolesData = await rolesRes.json();
        setRoles(rolesData.map((r: { name: string }) => r.name));

        // Then try to load the specific user by ID
        if (!userId) {
          throw new Error('No user ID provided');
        }

        const userRes = await fetch(`${API}/admin/users/${userId}`, { credentials: 'include' });
        if (!userRes.ok) {
          if (userRes.status === 404) {
            throw new Error(`User with ID ${userId} not found`);
          }
          throw new Error(`Failed to load user: ${userRes.status} ${await userRes.text()}`);
        }

        const userData = await userRes.json();
        setUser(userData);
        setEmail(userData.email || '');
        setUserName(userData.userName || '');
        setUserRoles(userData.roles || []);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error loading user data';
        console.error('Error loading user:', errorMessage);
        toast.error('Failed to load user', {
          description: errorMessage,
          durationMs: 5000
        });
        // Navigate back to users list on error
        navigate('/admin/users');
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [userId, toast, navigate]);

  const saveUser = async () => {
    if (!user) return;
    
    setBusy(true);
    try {
      // Update user profile
      const profileRes = await fetch(`${API}/admin/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, userName }),
      });
      
      if (!profileRes.ok) {
        throw new Error(`Failed to update user profile: ${profileRes.status} ${await profileRes.text()}`);
      }

      // Update user roles
      const rolesRes = await fetch(`${API}/admin/users/${user.id}/roles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ roles: userRoles }),
      });
      
      if (!rolesRes.ok) {
        throw new Error(`Failed to update user roles: ${rolesRes.status} ${await rolesRes.text()}`);
      }

      toast.success('User updated successfully', {
        description: 'User information has been saved',
        durationMs: 4000
      });
      
      // Navigate back to users list after successful update
      navigate('/admin/users');
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

  const resetPassword = async () => {
    if (!user) return;
    
    setResetBusy(true);
    try {
      // Reset user password
      const resetRes = await fetch(`${API}/admin/users/${user.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          newPassword: newPassword.trim() || null // If empty, server will generate a random password
        }),
      });
      
      if (!resetRes.ok) {
        throw new Error(`Failed to reset password: ${resetRes.status} ${await resetRes.text()}`);
      }

      const result = await resetRes.json();
      
      toast.success('Password reset successful', {
        description: result.passwordWasGenerated 
          ? 'A new random password has been generated for this user. They will need to use password recovery to set a new one.' 
          : 'The password has been updated successfully.',
        durationMs: 5000
      });
      
      // Clear the password field
      setNewPassword('');
    } catch (err) {
      const description = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to reset password', { 
        description, 
        durationMs: 6000 
      });
    } finally {
      setResetBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Loading user information...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-error">
        User not found or could not be loaded.
        <button 
          className="admin-button" 
          onClick={() => navigate('/admin/users')}
        >
          Return to Users List
        </button>
      </div>
    );
  }

  return (
    <div className="admin-user-edit-container">
      <div className="admin-user-edit-header">
        <h2>Edit User: {email || userName || user.id}</h2>
      </div>

      <div className="admin-form-body">
        <div className="admin-form-grid">
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
                  />
                  <span className="admin-role-checkbox-label">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="admin-form-group admin-password-section">
            <label className="admin-form-label">Reset Password</label>
            <div className="admin-password-input-container">
              <input
                className="admin-form-input"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password or leave empty to generate one"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? 
                  <EyeOff width={18} height={18} /> : 
                  <Eye width={18} height={18} />
                }
              </button>
            </div>
            <div className="admin-password-help">
              <p>Leave empty to generate a random secure password. The user will need to use password recovery to set a new one.</p>
              <button
                className="admin-reset-button"
                disabled={resetBusy}
                onClick={resetPassword}
              >
                {resetBusy ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </div>

          <div className="admin-form-actions">
            <button 
              className="admin-cancel-button" 
              onClick={() => navigate('/admin/users')}
            >
              Cancel
            </button>
            <button 
              className="admin-save-button" 
              disabled={busy} 
              onClick={saveUser}
            >
              {busy ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
