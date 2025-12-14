import { Outlet } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import NavTabs from "../NavTabs";
import RewardPopup from "../RewardPopup";
import "./Layout.css";
import { ThemeToggle } from "@asafarim/react-themes";
import { useAuth } from "../../hooks/useAuth";
import { isProduction } from "@asafarim/shared-ui-react";
import { User, LogIn, LogOut, UserPlus, ChevronDown } from "lucide-react";

export default function Layout() {
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  const handleSignIn = () => {
    signIn();
  };

  const handleSignOut = async () => {
    setShowUserMenu(false);
    await signOut(`${window.location.origin}/`);
  };

  const handleRegister = () => {
    const returnUrl = window.location.href;
    const encodedReturnUrl = encodeURIComponent(returnUrl);
    const registerUrl = isProduction
      ? `https://identity.asafarim.be/register?returnUrl=${encodedReturnUrl}`
      : `http://identity.asafarim.local:5177/register?returnUrl=${encodedReturnUrl}`;
    window.location.href = registerUrl;
  };

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="logo">
          <span className="logo-icon">🎨</span>
          <span className="logo-text">KidCode Studio</span>
        </div>
        <NavTabs />
        <div className="header-actions">
          <ThemeToggle variant="ghost" />

          {loading ? (
            <div className="auth-loading">
              <span className="loading-spinner">⏳</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="user-menu" ref={menuRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <User size={18} />
                <span className="user-email">{user.email || "User"}</span>
                <ChevronDown
                  size={16}
                  className={showUserMenu ? "rotated" : ""}
                />
              </button>

              {showUserMenu && (
                <div className="user-menu-dropdown">
                  <div className="user-menu-header">
                    <User size={20} />
                    <div className="user-info">
                      <div className="user-name">{user.email}</div>
                      <div className="user-role">Student</div>
                    </div>
                  </div>
                  <div className="user-menu-divider" />
                  <button className="user-menu-item" onClick={handleSignOut}>
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <button className="btn-sign-in" onClick={handleSignIn}>
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
              <button className="btn-register" onClick={handleRegister}>
                <UserPlus size={16} />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
      <RewardPopup />
    </div>
  );
}
