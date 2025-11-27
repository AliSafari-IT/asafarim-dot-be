import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Layout.css";
import { getNoteCount } from "../api/notesApi";
import { useAuth } from "../contexts/useAuth";
import { ButtonComponent as Button } from "@asafarim/shared-ui-react";

export default function Layout({ children }: { children: React.ReactNode }) {
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
              <div className="logo-icon">📚</div>
              <h1 className="logo-text">Study Notes</h1>
            </div>
            
            {isAuthenticated && (
              <>
                <div className="header-stats">
                  <div className="stat-item">
                    <span className="stat-number">{noteCount}</span>
                    <span className="stat-label">Notes</span>
                  </div>
                </div>
                
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
          </div>
        </header>
        <main className="layout-main">{children}</main>
      </div>
    </div>
  );
}
