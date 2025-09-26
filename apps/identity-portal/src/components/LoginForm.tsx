import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Arrow, Button, Lock } from "@asafarim/shared-ui-react";


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
        console.log('Login successful! Redirecting...');
        // get returnUrl from query params
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        
        // Check if returnUrl is an external URL
        if (returnUrl && (returnUrl.startsWith('http://') || returnUrl.startsWith('https://'))) {
          console.log('Redirecting to external URL:', returnUrl);
          window.location.href = returnUrl;
        } else {
          // Internal navigation using React Router
          console.log('Navigating to internal path:', returnUrl || '/dashboard');
          navigate(returnUrl || '/dashboard', { replace: true });
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

      <Button disabled={isLoading} rightIcon={<Lock />} variant="success">
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
