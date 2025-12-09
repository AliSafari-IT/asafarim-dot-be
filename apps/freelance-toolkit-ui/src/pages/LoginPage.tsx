// apps/freelance-toolkit-ui/src/api/LoginPage.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@asafarim/shared-ui-react";
import "../styles/pages/login.css";

export const LoginPage = () => {
  const { isAuthenticated, signIn, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user just logged out
    const justLoggedOut = new URLSearchParams(window.location.search).has(
      "_logout"
    );

    if (!loading) {
      if (isAuthenticated && !justLoggedOut) {
        navigate("/dashboard");
      } else if (!isAuthenticated && !justLoggedOut) {
        // Redirect to Identity Portal for login
        signIn(window.location.origin);
      }
      // If justLoggedOut is true, stay on login page
    }
  }, [isAuthenticated, loading, navigate, signIn]);

  return (
    <div className="flt-login-container ">
      <div className="flt-login-card">
        <div className="flt-login-header">
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💼</div>
          <h2 className="flt-login-title">Freelance Toolkit</h2>
        </div>
        <p className="flt-login-subtitle">
          Redirecting to login...
        </p>
      </div>
    </div>
  );
};
