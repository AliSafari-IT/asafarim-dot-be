import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";
import { getNoteCount } from "../api/notesApi";
import { useAuth } from "../contexts/useAuth";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";
import TagsSidebar from "./TagsSidebar";
import { ThemeToggle } from '@asafarim/react-themes';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [noteCount, setNoteCount] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      async function loadNoteCount() {
        try {
          const count = await getNoteCount();
          setNoteCount(count);
        } catch (error) {
          console.error("Failed to load note count:", error);
        }
      }
      loadNoteCount();
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="layout">
      <div className="layout-background">
        <div className="layout-pattern"></div>
      </div>
      <div className="layout-container">
        <header className="layout-header">
          <div className="header-content">
            <div className="logo">
              <Button
                variant="ghost"
                size="lg"
                to="/"
                leftIcon="📚"
                className="logo-icon"
              >
                Study Notes
              </Button>
            </div>

            {isAuthenticated && (
              <>
                <nav className="header-nav">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="nav-btn"
                  >
                    📝 Notes ({noteCount})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/analytics")}
                    className="nav-btn"
                  >
                    📊 Analytics
                  </Button>
                </nav>

                <div className="header-user">
                  <div className="user-info">
                    <span className="user-avatar">👤</span>
                    <span className="user-name">{user?.username}</span>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogout}
                    className="logout-btn"
                  >
                    🚪 Logout
                  </Button>
                </div>
              </>
            )}
            {!isAuthenticated && (
              <div className="header-user">
                <div className="user-info">
                  <span className="user-avatar">👤</span>
                  <span className="user-name">Guest</span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/login")}
                  className="logout-btn"
                >
                  🚪 Login
                </Button>
              </div>
            )}
            <ThemeToggle />
          </div>
        </header>
        {isAuthenticated && location.pathname === "/" ? (
          <div className="layout-with-sidebar">
            <TagsSidebar />
            <main className="layout-main">{children}</main>
          </div>
        ) : (
          <main className="layout-main">{children}</main>
        )}
      </div>
    </div>
  );
}
