import { useState, useEffect } from 'react';
import { useToast } from '@asafarim/toast';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, UserPlus, Check, X } from 'lucide-react';
import './admin-components.css';

export default function AddNewUser() {
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
    roles: [] as string[]
  });
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
        const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
        const response = await fetch(`${base}/admin/roles`, { 
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to load roles: ${response.status} ${response.statusText}`);
        }
        
        const rolesJson = await response.json();
        setAvailableRoles(rolesJson.map((r: { name: string }) => r.name));
      } catch (err) {
        const description = err instanceof Error ? err.message : 'Unknown error';
        toast.error('Failed to load roles', { 
          description,
          durationMs: 6000 
        });
      } finally {
        setLoadingRoles(false);
      }
    };
    
    loadRoles();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleRole = (role: string) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter(r => r !== role)
        : [...prev.roles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast.error('Email is required', { 
        description: 'Please provide a valid email address',
        durationMs: 4000 
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const base = import.meta.env.VITE_IDENTITY_API_URL || 'http://localhost:5101';
      const response = await fetch(`${base}/admin/users/with-null-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          userName: formData.userName || formData.email.split('@')[0],
          roles: formData.roles.length > 0 ? formData.roles : undefined
        })
      });
      
      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        let message = `Failed to create user: ${response.status} ${response.statusText}`;
        try {
          if (contentType.includes('application/json')) {
            const data = await response.json();
            if (data?.message) {
              message = data.message;
            } else if (data?.errors) {
              // ASP.NET Core ValidationProblemDetails
              const errors: string[] = [];
              Object.keys(data.errors).forEach((key) => {
                const arr = data.errors[key];
                if (Array.isArray(arr)) errors.push(...arr);
              });
              if (errors.length) message = errors.join('\n');
            }
          } else {
            const text = await response.text();
            if (text) message = text;
          }
        } catch {
          // ignore parse errors, keep default message
        }
        throw new Error(message);
      }
      
      toast.success('User created successfully', {
        description: 'An email has been sent to the user to set their password',
        durationMs: 5000
      });
      
      navigate('/admin-area/users');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error('Failed to create user', {
        description: message,
        durationMs: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container" data-testid="add-new-user-component">
      <div className="admin-header">
        <button 
          onClick={() => navigate('/admin-area/users')} 
          className="btn btn-ghost"
          disabled={loading}
        >
          <ArrowLeft size={18} className="mr-2" />
          Back to Users
        </button>
        <div>
          <h1>Add New User</h1>
          <p className="admin-subtitle">
            Create a new user account with temporary access
          </p>
        </div>
      </div>

      <div className="admin-form-container">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address <span className="text-danger">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              placeholder="user@example.com"
              required
              autoFocus
              disabled={loading}
            />
            <p className="form-hint">
              The user will receive an email to set their password
            </p>
          </div>
          
          <div className="form-group">
            <label htmlFor="userName" className="form-label">
              Username
            </label>
            <input
              type="text"
              id="userName"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              className="form-input"
              placeholder="Leave blank to generate from email"
              disabled={loading}
            />
            <p className="form-hint">
              {formData.userName || formData.email 
                ? `Will be displayed as: ${formData.userName || formData.email.split('@')[0]}`
                : 'If left blank, will use the email username'}
            </p>
          </div>
          
          <div className="form-group">
            <label className="form-label">Assign Roles</label>
            {loadingRoles ? (
              <div className="loading-state">
                <Loader2 className="animate-spin mr-2" size={18} />
                <span>Loading available roles...</span>
              </div>
            ) : availableRoles.length === 0 ? (
              <div className="empty-state">
                <p>No roles available. Please create roles first.</p>
              </div>
            ) : (
              <div className="role-grid">
                {availableRoles.map(role => (
                  <div 
                    key={role} 
                    className={`role-option ${formData.roles.includes(role) ? 'selected' : ''}`}
                    onClick={() => toggleRole(role)}
                  >
                    <div className="role-checkbox">
                      {formData.roles.includes(role) && <Check size={14} />}
                    </div>
                    <span className="role-name">{role}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="info-card">
            <h4>About User Creation</h4>
            <ul className="info-list">
              <li>User will receive an email to set their password</li>
              <li>Account will be active immediately after creation</li>
              <li>Assigned roles grant specific permissions</li>
            </ul>
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/admin-area/users')}
              className="btn btn-secondary"
              disabled={loading}
            >
              <X size={18} className="mr-2" />
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || loadingRoles}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Creating User...
                </>
              ) : (
                <>
                  <UserPlus size={18} className="mr-2" />
                  Create User
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}