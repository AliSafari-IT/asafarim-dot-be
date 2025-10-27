import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useToast } from '@asafarim/toast';
import { identityService } from '../api/identityService';
import '../components/auth-layout.css';
import '../components/auth-components.css';

export default function SetupPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [email, setEmail] = useState('');
  const [tokenValid, setTokenValid] = useState(false);

  // Extract and validate token from URL
  useEffect(() => {
    // Only validate once - if already validated, skip
    if (tokenValid) {
      return;
    }

    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast.error('Invalid Link', {
        description: 'No token provided in the URL',
        durationMs: 5000,
      });
      navigate('/login');
      return;
    }

    setToken(tokenParam);
    
    // Validate token
    const validate = async (token: string) => {
      try {
        setValidating(true);
        const response = await identityService.validateSetupToken({ token });
        setEmail(response.email);
        setTokenValid(true);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Token validation failed';
        toast.error('Invalid or Expired Link', {
          description: message,
          durationMs: 5000,
        });
        setTimeout(() => navigate('/login'), 2000);
      } finally {
        setValidating(false);
      }
    };
    
    validate(tokenParam);
  }, [searchParams, navigate, toast, tokenValid]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error('Password Required', {
        description: 'Please enter and confirm your password',
        durationMs: 4000,
      });
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords Do Not Match', {
        description: 'Please make sure both passwords are identical',
        durationMs: 4000,
      });
      return;
    }

    if (password.length < 8) {
      toast.error('Password Too Short', {
        description: 'Password must be at least 8 characters long',
        durationMs: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      const response = await identityService.setupPassword({
        token,
        password,
      });

      toast.success('Password Set Successfully', {
        description: 'You are now logged in. Redirecting to dashboard...',
        durationMs: 3000,
      });

      // Store auth tokens
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to set password';
      toast.error('Error Setting Password', {
        description: message,
        durationMs: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Validating your link...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="error-message">
            <p>This link is invalid or has expired.</p>
            <p>Please request a new password setup link.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Set Your Password</h1>
          <p className="auth-subtitle">Welcome! Please create a secure password for your account.</p>
          {email && <p className="auth-email">Email: {email}</p>}
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-control"
              placeholder="Enter your password"
              required
              disabled={loading}
              autoFocus
            />
            <small className="form-text">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </small>
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
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Setting Password...' : 'Set Password'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-muted">
            This link will expire in 24 hours
          </p>
        </div>
      </div>
    </div>
  );
}
