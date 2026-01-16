import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { identityService } from '../api/identityService';
import './registration-success-modal.css';

interface RegistrationSuccessModalProps {
  email: string;
  onClose: () => void;
  onResendSuccess?: () => void;
}

export function RegistrationSuccessModal({
  email,
  onClose,
  onResendSuccess,
}: RegistrationSuccessModalProps) {
  const navigate = useNavigate();
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    primaryButtonRef.current?.focus();

    // Lock scroll while modal is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleGoToLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleResendEmail = async () => {
    try {
      await identityService.resendConfirmation({ email });
      onResendSuccess?.();
    } catch (error) {
      console.error('Failed to resend confirmation email:', error);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const modal = (
    <div
      className="regsuccess-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        className="regsuccess-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="regsuccess-title"
      >
        <div className="regsuccess-header">
          <h2 id="regsuccess-title" className="regsuccess-title">
            Registration successful
          </h2>
          <button
            className="regsuccess-close"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            ×
          </button>
        </div>

        <div className="regsuccess-body">
          <div className="regsuccess-icon" aria-hidden="true">
            ✓
          </div>
          <p className="regsuccess-message">
            We sent a confirmation email to <strong>{email}</strong>
          </p>
          <p className="regsuccess-submessage">
            Please confirm your email address before logging in.
          </p>
        </div>

        <div className="regsuccess-actions">
          <button
            ref={primaryButtonRef}
            className="regsuccess-btn regsuccess-btn-primary"
            onClick={handleGoToLogin}
            type="button"
          >
            Go to login
          </button>

          <button
            className="regsuccess-btn regsuccess-btn-secondary"
            onClick={handleResendEmail}
            type="button"
          >
            Resend email
          </button>

          <button
            className="regsuccess-btn regsuccess-btn-tertiary"
            onClick={onClose}
            type="button"
          >
            Change email
          </button>
        </div>
      </div>
    </div>
  );

  // Render to body to avoid stacking-context/transform issues
  return createPortal(modal, document.body);
}
