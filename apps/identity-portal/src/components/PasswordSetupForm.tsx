import { useState } from 'react';
import { useToast } from '@asafarim/toast';
import identityService from '../api/identityService';
import './auth-components.css';

interface PasswordSetupFormProps {
  userId: string;
  email: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PasswordSetupForm({ userId, email, onSuccess, onCancel }: PasswordSetupFormProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const toast = useToast();

  // Password validation function
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    if (!/[A-Z]/.test(pwd)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (!/[a-z]/.test(pwd)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (!/[0-9]/.test(pwd)) {
      return 'Password must contain at least one number';
    }
    if (!/[^A-Za-z0-9]/.test(pwd)) {
      return 'Password must contain at least one special character';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Setting up password for user:', userId);
      
      const data = await identityService.setupPassword({
        userId,
        password
      });
      
      // Store tokens in localStorage (if your app uses them)
      localStorage.setItem('token', data.token);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      toast.success('Password set successfully', {
        description: 'You are now logged in',
        durationMs: 4000
      });
      
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      toast.error('Failed to set password', {
        description: message,
        durationMs: 6000
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Set Your Password</h2>
      <p className="auth-subtitle">
        Please create a password for your account: <strong>{email}</strong>
      </p>
      
      <div className="password-requirements">
        <p><strong>Password requirements:</strong></p>
        <ul>
          <li className={password.length >= 8 ? 'met' : ''}>At least 8 characters long</li>
          <li className={/[A-Z]/.test(password) ? 'met' : ''}>At least one uppercase letter</li>
          <li className={/[a-z]/.test(password) ? 'met' : ''}>At least one lowercase letter</li>
          <li className={/[0-9]/.test(password) ? 'met' : ''}>At least one number</li>
          <li className={/[^A-Za-z0-9]/.test(password) ? 'met' : ''}>At least one special character</li>
        </ul>
      </div>
      
      {error && <div className="auth-error">{error}</div>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="form-control"
            placeholder="Enter a secure password"
            required
            autoFocus
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="form-control"
            placeholder="Confirm your password"
            required
          />
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
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
            {loading ? 'Setting Password...' : 'Set Password & Login'}
          </button>
        </div>
      </form>
    </div>
  );
}
