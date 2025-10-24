import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Arrow, ButtonComponent as Button } from "@asafarim/shared-ui-react";
import "./auth-layout.css";

export const RegisterForm = () => {
  const { register, error, clearError, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear any previous errors when user starts typing
    if (error) clearError();
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const success = await register(formData);
      if (success) {
        // Show success notification
        console.log('✅ Registration successful! Redirecting...');
        
        // Set flag to prevent Register page's useEffect from also redirecting
        sessionStorage.setItem('registration_just_completed', 'true');
        console.log('✅ Set registration_just_completed flag in sessionStorage');
        
        // Get returnUrl from query params
        let returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        console.log('🔄 Original returnUrl:', returnUrl);
        
        // Prevent infinite loop: if returnUrl points to register page, use dashboard instead
        const isReturnUrlRegisterPage = returnUrl && (
          returnUrl === '/register' || 
          returnUrl.endsWith('/register') ||
          returnUrl.includes('/register?') ||
          returnUrl.includes('/register#')
        );
        
        if (isReturnUrlRegisterPage) {
          console.log('⚠️ returnUrl points to register page, redirecting to dashboard instead');
          returnUrl = null; // Will use default '/dashboard'
        }
        
        // Get the target URL
        const targetPath = returnUrl || '/dashboard';
        
        // Check if we need to perform a cross-domain redirect
        const isCrossDomainRedirect = returnUrl && (
          returnUrl.startsWith('http://') || 
          returnUrl.startsWith('https://') || 
          returnUrl.includes('.asafarim.be')
        );
        
        if (returnUrl && isCrossDomainRedirect) {
          // For cross-domain redirects, we need to ensure cookies are fully established
          const targetUrl = returnUrl.startsWith('http') 
            ? returnUrl 
            : `https://${returnUrl}`;
            
          console.log('🌐 Performing cross-domain redirect to:', targetUrl);
          
          // Add a timestamp to prevent caching issues
          const separator = targetUrl.includes('?') ? '&' : '?';
          const finalUrl = `${targetUrl}${separator}_t=${Date.now()}`;
          
          // Use window.location for cross-domain redirects
          window.location.href = finalUrl;
        } else {
          // Internal navigation - use window.location to ensure it actually happens
          console.log('🏠 Redirecting to internal path:', targetPath);
          
          // Force a small delay to ensure cookies are readable by the browser
          setTimeout(() => {
            // Use replace() to avoid back button issues
            window.location.replace(targetPath);
          }, 500);
        }
      }
    } catch {
      // Error is handled by the auth context
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
        <div className="message message-error">
          <div className="message-header">
            <svg xmlns="http://www.w3.org/2000/svg" className="message-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="message-title">Error</p>
          </div>
          <p className="message-content">{error}</p>
        </div>
      )}
      
      <div className="form-group">
        <label htmlFor="email" className="form-label">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${validationErrors.email ? 'input-error' : ''}`}
          value={formData.email}
          onChange={handleChange}
          required
          autoFocus
        />
        {validationErrors.email && (
          <p className="error-text">{validationErrors.email}</p>
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
        <label htmlFor="password" className="form-label">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${validationErrors.password ? 'input-error' : ''}`}
          value={formData.password}
          onChange={handleChange}
          required
        />
        {validationErrors.password && (
          <p className="error-text">{validationErrors.password}</p>
        )}
      </div>
      
      <div className="form-group">
        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
        <input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          className={`form-input ${validationErrors.confirmPassword ? 'input-error' : ''}`}
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        {validationErrors.confirmPassword && (
          <p className="error-text">{validationErrors.confirmPassword}</p>
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
  );
};

export default RegisterForm;
