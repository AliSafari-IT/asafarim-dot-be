import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Arrow, ButtonComponent as Button } from "@asafarim/shared-ui-react";
import { useFormValidation, registerSchema, getPasswordStrength } from "@asafarim/shared-validation";
import type { RegisterInput } from "@asafarim/shared-validation";
import { RegistrationSuccessModal } from './RegistrationSuccessModal';
import { useToast  } from '@asafarim/toast';
import "./auth-layout.css";
import "./password-strength.css";

// Helper function to provide user-friendly error messages
function getErrorMessage(error: string | null): { title: string; message: string; action?: string } | null {
  if (!error) return null;

  // Map backend errors to user-friendly messages
  if (error.includes("Email is already registered")) {
    return {
      title: "Email Already Registered",
      message: "This email is already associated with an account.",
      action: "Try logging in instead, or use a different email to register."
    };
  }

  

  if (error.includes("Password")) {
    return {
      title: "Password Requirements",
      message: "Your password does not meet the requirements.",
      action: "Ensure your password is at least 8 characters long and contains a mix of letters and numbers."
    };
  }

  if (error.includes("Failed to fetch") || error.includes("Network")) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the authentication server.",
      action: "Please check your internet connection and try again."
    };
  }

  if (error.includes("validation")) {
    return {
      title: "Validation Error",
      message: "Please check your input and try again.",
      action: "Make sure all fields are filled correctly."
    };
  }

  // Default error message
  return {
    title: "Registration Failed",
    message: error,
    action: "Please try again or contact support if the problem persists."
  };
}

export const RegisterForm = () => {
  const { register, error, clearError, isLoading } = useAuth();
  const { errors, validate, validateField, clearFieldError } = useFormValidation(registerSchema);
  const [formData, setFormData] = useState<RegisterInput>({
    email: '',
    userName: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const toast = useToast();

  // Password strength indicator
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: [] as string[] });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous errors when user starts typing
    if (error) clearError();
    clearFieldError(name as keyof RegisterInput);

    // Update password strength if password field changed
    if (name === 'password') {
      setPasswordStrength(getPasswordStrength(value));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate field when user leaves it (blur event)
    // This is better UX than validating on every keystroke
    if (value) {
      validateField(name as keyof RegisterInput, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Transform empty userName to undefined before validation
    const submitData = {
      ...formData,
      userName: formData.userName || undefined
    };
    
    if (!validate(submitData)) {
      return;
    }
    
    try {
      const success = await register(submitData);
      if (success) {
        // Show success modal instead of redirecting
        setRegisteredEmail(formData.email);
        setShowSuccessModal(true);
      }
    } catch {
      // Error is handled by the auth context
    }
  };

  const handleResendSuccess = () => {
    toast.success('Confirmation email sent! Please check your inbox.');
  };

  const errorInfo = getErrorMessage(error);

  return (
    <>
      {showSuccessModal && (
        <RegistrationSuccessModal
          email={registeredEmail}
          onClose={() => setShowSuccessModal(false)}
          onResendSuccess={handleResendSuccess}
        />
      )}
      <form className="auth-form" data-testid="register-form" onSubmit={handleSubmit}>
      {errorInfo && (
        <div className="message message-error">
          <div className="message-header">
            <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="message-title">{errorInfo.title}</p>
          </div>
          <p className="message-content">{errorInfo.message}</p>
          {errorInfo.action && (
            <p className="message-action">{errorInfo.action}</p>
          )}
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errors.email ? 'input-error' : ''}`}
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoFocus
        />
        {errors.email && (
          <p className="error-text">{errors.email}</p>
        )}
      </div>
      
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="firstName" className="form-label">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="form-input"
            value={formData.firstName}
            onChange={handleChange}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="lastName" className="form-label">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="form-input"
            value={formData.lastName}
            onChange={handleChange}
          />
        </div>
      </div>
      
      <div className="form-group">
        <label htmlFor="userName" className="form-label">Username (Optional)</label>
        <input
          type="text"
          id="userName"
          name="userName"
          className="form-input"
          placeholder="Leave empty to use email"
          value={formData.userName || ''}
          onChange={handleChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errors.password ? 'input-error' : ''}`}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.password && (
          <p className="error-text">{errors.password}</p>
        )}
        
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="password-strength">
            <div className="password-strength-bar">
              <div 
                className={`strength-${passwordStrength.score}`}
                style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
              />
            </div>
            <div className="password-strength-text">
              {passwordStrength.score === 0 && "Very Weak"}
              {passwordStrength.score === 1 && "Weak"}
              {passwordStrength.score === 2 && "Fair"}
              {passwordStrength.score === 3 && "Good"}
              {passwordStrength.score === 4 && "Strong"}
              {passwordStrength.score === 5 && "Very Strong"}
            </div>
            {passwordStrength.feedback.length > 0 && (
              <div className="password-requirements">
                <small>Missing requirements:</small>
                <ul>
                  {passwordStrength.feedback.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`form-input ${errors.confirmPassword ? 'input-error' : ''}`}
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        />
        {errors.confirmPassword && (
          <p className="error-text">{errors.confirmPassword}</p>
        )}
      </div>
      
      <Button 
        type="submit"  
        disabled={isLoading}
        variant="brand"
        rightIcon={<Arrow />}
        style={{ width: '100%' }}
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>
      
      <div className="auth-links">
        <p>
          Already have an account? <Link to="/login" className="form-link">Sign in</Link>
        </p>
      </div>
    </form>
    </>
  );
};

export default RegisterForm;
