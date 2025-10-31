import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@asafarim/toast';
import { identityService } from '../api/identityService';
import '../components/auth-layout.css';
import '../components/auth-components.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Email Required', {
        description: 'Please enter your email address',
        durationMs: 4000,
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Invalid Email', {
        description: 'Please enter a valid email address',
        durationMs: 4000,
      });
      return;
    }

    setLoading(true);

    try {
      await identityService.requestPasswordReset({ email });

      toast.success('Email Sent', {
        description: 'Check your email for password reset instructions',
        durationMs: 5000,
      });

      setSubmitted(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error('Error', {
        description: message,
        durationMs: 6000,
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Check Your Email</h1>
            <p className="auth-subtitle">
              We've sent password reset instructions to your email address.
            </p>
          </div>
          <div className="auth-footer">
            <p className="text-muted">
              Redirecting to login page...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Forgot Password?</h1>
          <p className="auth-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-control"
              placeholder="Enter your email"
              required
              disabled={loading}
              autoFocus
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <p className="text-muted">
            Remember your password?{' '}
            <a href="/login" className="link">
              Back to login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
