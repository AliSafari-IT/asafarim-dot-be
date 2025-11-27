import React from "react";
import { useAuth } from "../contexts/useAuth";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        flexDirection: "column",
        gap: "1rem"
      }}>
        <div style={{ fontSize: "2rem" }}>🔐</div>
        <div>Loading authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        height: "100vh",
        gap: "2rem",
        padding: "2rem",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "3rem" }}>🔒</div>
        <h2>Authentication Required</h2>
        <p>Please sign in to access this page.</p>
        <Button onClick={() => window.location.href = "/login"} variant="primary">
          Go to Login
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
