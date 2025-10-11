import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Arrow, ButtonComponent as Button, Lock } from "@asafarim/shared-ui-react";


export const LoginForm = () => {
  const { login, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      const success = await login(formData);
      if (success) {
        // Show success notification
        console.log('👍 Login successful! Preparing redirect...');
        
        // Get returnUrl from query params
        let returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        console.log('🔄 Original returnUrl:', returnUrl);
        
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
        await new Promise(resolve => setTimeout(resolve, 100));
        
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
          // Internal navigation using React Router
          const internalPath = returnUrl || '/dashboard';
          console.log('🏠 Navigating to internal path:', internalPath);
          navigate(internalPath, { replace: true });
        }
      }
    } catch (error) {
      console.error('❌ Error during login submission:', error);
      // Error is handled by the auth context
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {error && (
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
            <p className="message-title">Error</p>
          </div>
          <p className="message-content">{error}</p>
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
          className="form-input"
          value={formData.email}
          onChange={handleChange}
          required
          autoFocus
          autoComplete="username email"
        />
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
          className="form-input"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
        />
      </div>

      <div className="form-group-checkbox">
        <label htmlFor="rememberMe" className="form-label flex items-center gap-sm mb-1">
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
