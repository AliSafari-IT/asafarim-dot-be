import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { identityService } from '../api/identityService';
import './confirm-email.css';

export function ConfirmEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (!userId || !token) {
      setStatus('error');
      setMessage('Invalid confirmation link');
      return;
    }

    confirmEmail(userId, token);
  }, [searchParams]);

  const confirmEmail = async (userId: string, token: string) => {
    try {
      const response = await identityService.confirmEmail({ userId, token });
      if (response.confirmed) {
        setStatus('success');
        setMessage(response.message || 'Email confirmed successfully');
      } else {
        setStatus('error');
        setMessage('Failed to confirm email');
      }
    } catch (error: unknown) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : 'Invalid or expired confirmation link';
      setMessage(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (!email) {
      alert('Please enter your email address');
      return;
    }

    try {
      await identityService.resendConfirmation({ email });
      alert('Confirmation email sent! Please check your inbox.');
    } catch (error: unknown) {
      console.error('Failed to resend confirmation email:', error);
      alert('Failed to resend confirmation email');
    }
  };

  const handleGoToLogin = () => {
    navigate('/login');
  };

  const handleGoToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="confirm-email-container">
      <div className="confirm-email-card">
        {status === 'loading' && (
          <>
            <div className="confirm-email-icon loading-icon">⏳</div>
            <h1 className="confirm-email-title">Confirming Email...</h1>
            <p className="confirm-email-message">Please wait while we confirm your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="confirm-email-icon success-icon">✓</div>
            <h1 className="confirm-email-title">Email Confirmed!</h1>
            <p className="confirm-email-message">{message}</p>
            <p className="confirm-email-submessage">You can now log in to your account.</p>
            <button className="confirm-email-button primary" onClick={handleGoToLogin}>
              Go to Login
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="confirm-email-icon error-icon">✕</div>
            <h1 className="confirm-email-title">Confirmation Failed</h1>
            <p className="confirm-email-message">{message}</p>
            <p className="confirm-email-submessage">
              The link may have expired or is invalid.
            </p>
            
            <div className="resend-section">
              <p className="resend-label">Enter your email to resend confirmation:</p>
              <input
                type="email"
                className="resend-input"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button className="confirm-email-button secondary" onClick={handleResendEmail}>
                Resend Confirmation Email
              </button>
            </div>

            <button className="confirm-email-button tertiary" onClick={handleGoToRegister}>
              Back to Registration
            </button>
          </>
        )}
      </div>
    </div>
  );
}
