import { useEffect, useState } from 'react';
import identityService, { type UserInfo } from '../api/identityService';
import { useToast } from '@asafarim/toast';
import { useAuth } from '../hooks/useAuth';
import { Save } from 'lucide-react';
import './admin-components.css';

export default function MeProfile() {
  const toast = useToast();
  const { updateProfile } = useAuth();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    userName: '',
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profile = await identityService.getProfile();
      setMe(profile);
      setFormData({
        email: profile.email || '',
        userName: (profile as unknown as { userName: string }).userName || '',
      });
    };
    void load();
  }, []);

  const save = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const updated = await identityService.updateProfile(formData);
      setMe(updated);
      updateProfile(updated);
      toast.success('Profile updated', { 
        description: 'Your changes have been saved.', 
        durationMs: 4000 
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      toast.error('Error', { description: message, durationMs: 6000 });
    } finally {
      setBusy(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="admin-container" data-testid="me-profile-component">
      <div className="admin-header">
        <h1>My Profile</h1>
        <p className="admin-subtitle">Update your account information</p>
      </div>

      <div className="admin-form-container">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            disabled={busy}
          />
        </div>

        <div className="form-group">
          <label htmlFor="userName" className="form-label">
            Username
          </label>
          <input
            id="userName"
            name="userName"
            type="text"
            className="form-input"
            value={formData.userName}
            onChange={handleChange}
            placeholder="Enter your username"
            disabled={busy}
          />
        </div>

        {me?.roles && (
          <div className="form-group">
            <label className="form-label">Roles</label>
            <div className="roles-container">
              {me.roles.map(role => (
                <span key={role} className="role-tag">
                  {role}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn btn-primary"
            onClick={save}
            disabled={busy}
          >
            {busy ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}