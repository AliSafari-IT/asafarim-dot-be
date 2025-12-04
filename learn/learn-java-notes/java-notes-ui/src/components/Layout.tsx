import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Layout.css";
import { getPublicNoteCount } from "../api/notesApi";
import { useAuth } from "../contexts/useAuth";
import {
  AppLauncher,
  AvatarWithMenu,
  ButtonComponent as Button,
  FooterContainer,
} from "@asafarim/shared-ui-react";
import { asafarimApps } from "./data/asafarimApps";
import TagsSidebar from "./TagsSidebar";
import { ThemeToggle } from "@asafarim/react-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [noteCount, setNoteCount] = useState(0);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      async function loadNoteCount() {
        try {
          const count = await getPublicNoteCount();
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
                aria-label="Study Notes"
                data-testid="study-notes-brand"
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
                    onClick={() => navigate("/feed")}
                    className="nav-btn"
                    aria-label="Feed"
                    data-testid="feed-button"
                  >
                    📚 Feed
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/search")}
                    className="nav-btn"
                    aria-label="Search"
                    data-testid="search-button"
                  >
                    🔍 Search
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/")}
                    className="nav-btn"
                    aria-label="Notes"
                    data-testid="notes-button"
                  >
                    📝 Notes ({noteCount})
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/analytics")}
                    className="nav-btn"
                    aria-label="Analytics"
                    data-testid="analytics-button"
                  >
                    📊 Analytics
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate("/tags/manage")}
                    className="nav-btn"
                    aria-label="Tag Management"
                    data-testid="tags-manage-button"
                  >
                    🏷️ Tags
                  </Button>
                  {user?.roles?.includes("ROLE_ADMIN") && (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => navigate("/admin")}
                      className="nav-btn"
                      aria-label="Admin Panel"
                      data-testid="admin-button"
                    >
                      ⚙️ Admin
                    </Button>
                  )}
                </nav>
              </>
            )}
            {!isAuthenticated && (
              <div className="header-user guest-nav">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/feed")}
                  className="nav-btn"
                  aria-label="Feed"
                >
                  📚 Feed
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/search")}
                  className="nav-btn"
                  aria-label="Search"
                >
                  🔍 Search
                </Button>
              </div>
            )}
            {/* Right side actions */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-md)",
              }}
            >
              {/* App Launcher */}
              <AppLauncher
                items={asafarimApps}
                columns={3}
                showSearch
                searchPlaceholder="Search apps..."
                triggerLabel="Open ASafariM apps"
                panelTitle="ASafariM Apps"
              />

              {/* Avatar with Menu (authenticated) or Login button (guest) */}
              {isAuthenticated && user ? (
                <AvatarWithMenu
                  user={{
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    displayName: user.displayName || user.username,
                    avatarUrl: user.avatarUrl,
                    roles: user.roles,
                    locked: user.locked,
                    lockReason: user.lockReason,
                    lockedAt: user.lockedAt,
                    lastLogin: user.lastLogin,
                    lastLoginIp: user.lastLoginIp,
                    failedLoginAttempts: user.failedLoginAttempts,
                    isAdmin: () => user.roles?.includes("ROLE_ADMIN") ?? false,
                  }}
                  size="md"
                  bordered
                  showStatusDot
                  statusColor={user.locked ? "var(--color-error)" : "var(--color-success)"}
                  onLogout={handleLogout}
                  onManageAccount={() => navigate("/account")}
                />
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate("/login")}
                  title="Login"
                  aria-label="Login"
                  data-testid="login-button"
                >
                  🔐 Login
                </Button>
              )}

              <ThemeToggle aria-label="theme-toggler" variant="ghost" />
            </div>
          </div>
        </header>
        {location.pathname === "/" || location.pathname === "/public" ? (
          <div className="layout-with-sidebar">
            <TagsSidebar />
            <main className="layout-main">{children}</main>
          </div>
        ) : (
          <main className="layout-main">{children}</main>
        )}
      </div>
      {/* {Add common footer section from the package @asafarim/shared-ui-react } */}
      <FooterContainer key={"asafarim-footer"} />
    </div>
  );
}
