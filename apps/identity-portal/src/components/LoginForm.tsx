import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export const LoginForm = () => {
  const { login, error, clearError, isLoading } = useAuth();
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
        console.log('Login successful! Redirecting to dashboard...');
        const returnUrl = new URLSearchParams(window.location.search).get('returnUrl');
        window.location.href = returnUrl || '/dashboard';
        // Redirect happens automatically via the useEffect in the Login component
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
        />
      </div>

      <div className="form-group">
        <div className="form-label-row">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <Link to="/forgot-password" className="form-link">
            Forgot password?
          </Link>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          className="form-input"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group-checkbox">
        <input
          type="checkbox"
          id="rememberMe"
          name="rememberMe"
          checked={formData.rememberMe}
          onChange={handleChange}
        />
        <label htmlFor="rememberMe">Remember me</label>
      </div>

      <button type="submit" className="btn-submit" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

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
