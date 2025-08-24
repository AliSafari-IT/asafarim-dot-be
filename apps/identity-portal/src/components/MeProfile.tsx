import { useEffect, useState } from 'react';
import './admin-components.css';
import identityService, { type UserInfo } from '../api/identityService';
import { useToast } from '@asafarim/toast';
import { useAuth } from '../hooks/useAuth';

export default function MeProfile() {
  const toast = useToast();
  const { updateUser } = useAuth();
  const [me, setMe] = useState<UserInfo | null>(null);
  const [email, setEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const load = async () => {
      const profile = await identityService.getProfile();
      setMe(profile);
      setEmail(profile.email || '');
      setUserName((profile as any).userName || '');
    };
    void load();
  }, []);

  const save = async () => {
    if (!me) return;
    setBusy(true);
    try {
      const updated = await identityService.updateProfile({ email, userName });
      setMe(updated);
      updateUser(updated);
      toast.success('Profile updated', { description: 'Your changes have been saved.', durationMs: 4000 });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="admin-user-profile-container">
      <div className="admin-user-profile-card">
        {/* Header */}
        <div className="admin-form-header">
          <h1 className="admin-form-title">My Profile</h1>
          <p className="admin-form-subtitle">Update your personal information</p>
        </div>

        {/* Form Body */}
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

            <div className="admin-form-group">
              <label className="admin-form-label">Roles</label>
              <input 
                className="admin-form-input"
                type="text"
                value={(me?.roles || []).join(' • ')}
                disabled
                readOnly
              />
            </div>

            <div className="admin-form-group">
              <button 
                className="admin-save-button" 
                disabled={busy} 
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


