// apps/identity-portal/src/components/LoginForm.tsx
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Arrow, ButtonComponent as Button, Lock } from "@asafarim/shared-ui-react";
import { useFormValidation, loginSchema } from "@asafarim/shared-validation";
import type { LoginInput } from "@asafarim/shared-validation";
import './LoginForm.css';

// Helper function to provide user-friendly error messages
function getErrorMessage(error: string | null): { title: string; message: string; action?: string } | null {
  if (!error) return null;

  // Map backend errors to user-friendly messages
  // Check for specific error codes first (more precise)
  // Error codes come in format: "code:message"
  if (error.startsWith("user_not_found:") || error.includes("user_not_found")) {
    return {
      title: "Email Not Found",
      message: "We couldn't find an account with this email address.",
      action: "Please check the email and try again, or create a new account by clicking 'Sign up' below."
    };
  }

  if (error.startsWith("invalid_credentials:") || error.includes("invalid_credentials")) {
    return {
      title: "Incorrect Password",
      message: "The password you entered is incorrect.",
      action: "Please try again. If you forgot your password, click 'Forgot password?' below."
    };
  }

  if (error.includes("Invalid email or password")) {
    return {
      title: "Login Failed",
      message: "The email or password you entered is incorrect.",
      action: "Please check your credentials and try again. If you forgot your password, click 'Forgot password?' below."
    };
  }

  if (error.includes("Account is locked")) {
    return {
      title: "Account Locked",
      message: "Your account has been locked due to too many failed login attempts.",
      action: "Please try again later or reset your password."
    };
  }

  if (error.includes("Password setup required")) {
    return {
      title: "Password Setup Required",
      message: "Your account exists but needs a password to be set.",
      action: "Click 'Forgot password?' to set up your password."
    };
  }

  if (error.includes("Failed to fetch") || error.includes("Network")) {
    return {
      title: "Connection Error",
      message: "Unable to connect to the authentication server.",
      action: "Please check your internet connection and try again."
    };
  }

  if (error.includes("Email is already registered")) {
    return {
      title: "Email Already Registered",
      message: "This email is already associated with an account.",
      action: "Try logging in instead, or use a different email to register."
    };
  }

  // Default error message
  return {
    title: "Error",
    message: error,
    action: "Please try again or contact support if the problem persists."
  };
}


export const LoginForm = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const { errors, validate, validateField, clearFieldError } = useFormValidation(loginSchema);
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear any previous errors when user starts typing
    if (error) clearError();
    clearFieldError(name as keyof LoginInput);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Validate field when user leaves it
    if (value && name !== 'rememberMe') {
      validateField(name as keyof LoginInput, value);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validate form before submission
    if (!validate(formData)) {
      return;
    }

    try {
      console.log('📝 Submitting login form...');
      const success = await login(formData);
      console.log('🔍 Login result:', success);
      
      if (success) {
        // Show success notification
        console.log('👍 Login successful! Preparing redirect...');
        
        // Set flag to prevent Login page's useEffect from also redirecting
        sessionStorage.setItem('login_just_completed', 'true');
        console.log('✅ Set login_just_completed flag in sessionStorage');
        
        // Get returnUrl from query params
        let returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        console.log('🔄 Original returnUrl:', returnUrl);
        
        // Decode the returnUrl if it's encoded
        if (returnUrl) {
          try {
            returnUrl = decodeURIComponent(returnUrl);
            console.log('🔄 Decoded returnUrl:', returnUrl);
          } catch (e) {
            console.warn('⚠️ Failed to decode returnUrl:', e);
          }
        }
        
        // Prevent infinite loop: if returnUrl points to login page, use dashboard instead
        const isReturnUrlLoginPage = returnUrl && (
          returnUrl === '/login' || 
          returnUrl.endsWith('/login') ||
          returnUrl.includes('/login?') ||
          returnUrl.includes('/login#')
        );
        
        if (isReturnUrlLoginPage) {
          console.log('⚠️ returnUrl points to login page, redirecting to dashboard instead');
          returnUrl = null; // Will use default '/dashboard'
        }
        
        // Wait briefly for cookies to be set, then redirect immediately
        // The login() function already waits 2 seconds and verifies auth
        console.log('⏱️ Preparing redirect...');
        
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
          // Use full URL redirect with properly encoded URL
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
    } catch (error) {
      console.error('❌ Error during login submission:', error);
      // Error is handled by the auth context
    }
  };

  const errorInfo = getErrorMessage(error);

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {errorInfo && (
        <div className="message message-error">
          <div className="message-header">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="message-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
        <label htmlFor="email" className="form-label">
          Email Address
        </label>
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
          autoComplete="username email"
        />
        {errors.email && (
          <p className="error-text">{errors.email}</p>
        )}
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <Button to="/forgot-password" variant="link" rightIcon={<Arrow />}>
            Forgot password?
          </Button>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          className={`form-input ${errors.password ? 'input-error' : ''}`}
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          required
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="error-text">{errors.password}</p>
        )}
      </div>

      <div className="form-group-checkbox">
        <label htmlFor="rememberMe" className="form-label checkbox-label">
          <input
            type="checkbox"
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
          />
          Remember me
        </label>
      </div>

      <Button type="submit" disabled={isLoading} rightIcon={<Lock />} variant="success">
        {isLoading ? "Signing in..." : "Sign In"}
      </Button>

      <div className="auth-links">
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="form-link">
            Sign up
          </Link>
        </p>
      </div>
    </form>
  );
};

export default LoginForm;
