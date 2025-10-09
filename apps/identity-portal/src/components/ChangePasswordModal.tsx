import { useState } from 'react';
import { ButtonComponent as Button } from '@asafarim/shared-ui-react';
import identityService from '../api/identityService';
import { useToast } from '@asafarim/toast';
import './change-password-modal.css';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setBusy(true);
    try {
      await identityService.changePassword({ 
        currentPassword, 
        newPassword, 
        confirmPassword 
      });
      
      toast.success('Password changed successfully', {
        durationMs: 4000
      });
      
      // Reset form and close modal
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? 'Failed to change password', {
        durationMs: 6000
      });
    } finally {
      setBusy(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Change Password</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className={errors.currentPassword ? 'form-input error' : 'form-input'}
                disabled={busy}
              />
              {errors.currentPassword && <div className="error-message">{errors.currentPassword}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={errors.newPassword ? 'form-input error' : 'form-input'}
                disabled={busy}
              />
              {errors.newPassword && <div className="error-message">{errors.newPassword}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={errors.confirmPassword ? 'form-input error' : 'form-input'}
                disabled={busy}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
          </div>
          
          <div className="modal-footer">
            <Button 
              onClick={onClose} 
              variant="secondary" 
              disabled={busy}
            >
              Cancel
            </Button>
            <button 
              type="submit" 
              className={`action-button btn-danger ${busy ? 'disabled' : ''}`}
              disabled={busy}
            >
              {busy ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
