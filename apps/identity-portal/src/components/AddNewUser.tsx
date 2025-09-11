import { useState, useEffect } from 'react';
import { useToast } from '@asafarim/toast';
import { useNavigate } from 'react-router-dom';
import './admin-components.css';

export default function AddNewUser() {
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [roles, setRoles] = useState<string[]>([]);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  // Load available roles
  useEffect(() => {
    const loadRoles = async () => {
      setLoadingRoles(true);
      try {
        const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5177';
        const response = await fetch(`${base}/admin/roles`, { credentials: 'include' });
        
        if (!response.ok) {
          throw new Error(`Failed to load roles: ${response.status} ${response.statusText}`);
        }
        
        const rolesJson = await response.json();
        setAvailableRoles(rolesJson.map((r: { name: string }) => r.name));
      } catch (err) {
        const description = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Failed to load roles', { description, durationMs: 6000 });
      } finally {
        setLoadingRoles(false);
      }
    };
    
    loadRoles();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error('Email is required', { durationMs: 4000 });
      return;
    }
    
    setLoading(true);
    
    try {
      const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5177';
      const response = await fetch(`${base}/admin/users/with-null-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          userName: userName || email,
          roles: roles.length > 0 ? roles : undefined
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Failed to create user: ${response.status} ${response.statusText}`);
      }
      
      await response.json(); // Get the result but we don't need to use it
      
      toast.success('User created successfully', {
        description: 'User will need to set password on first login',
        durationMs: 5000
      });
      
      // Navigate back to users list
      navigate('/admin/users');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Failed to create user', {
        description: message,
        durationMs: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (role: string) => {
    if (roles.includes(role)) {
      setRoles(roles.filter(r => r !== role));
    } else {
      setRoles([...roles, role]);
    }
  };

  return (
    <div className="container">
      {/* Premium Header */}
      <div className="hero">
        <h1 className="hero__title">Add New User</h1>
        <p className="hero__subtitle">Create a new user with null password hash</p>
      </div>

      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="user@example.com"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="userName">Username (optional)</label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="form-control"
              placeholder="Leave blank to use email as username"
            />
            <small className="form-text text-muted">
              If left blank, email will be used as username
            </small>
          </div>
          
          <div className="form-group">
            <label>Roles</label>
            {loadingRoles ? (
              <div className="loading-indicator">Loading roles...</div>
            ) : (
              <div className="role-selection">
                {availableRoles.map(role => (
                  <div key={role} className="role-checkbox">
                    <input
                      type="checkbox"
                      id={`role-${role}`}
                      checked={roles.includes(role)}
                      onChange={() => toggleRole(role)}
                    />
                    <label htmlFor={`role-${role}`}>{role}</label>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="form-note">
            <strong>Note:</strong> User will be created with a null password hash. 
            They will need to set their password on first login.
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin/users')}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Creating User...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
