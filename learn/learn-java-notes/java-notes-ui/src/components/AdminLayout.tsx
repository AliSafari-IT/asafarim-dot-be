import { Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import "./AdminLayout.css";
import { ThemeToggle } from "@asafarim/react-themes";
import { ButtonComponent as Button, SignOut } from "@asafarim/shared-ui-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Check if user is admin (check for ROLE_ADMIN permission)
  const isAdmin = user?.roles?.includes("ROLE_ADMIN");

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: "/admin", label: "Dashboard", icon: "📊" },
    { path: "/admin/users", label: "Users", icon: "👥" },
    { path: "/admin/roles", label: "Roles", icon: "🎭" },
    { path: "/admin/permissions", label: "Permissions", icon: "🔐" },
    { path: "/admin/logs", label: "Audit Logs", icon: "📜" },
    { path: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get current page title
  const currentPage = navItems.find((item) => isActive(item.path));
  const pageTitle = currentPage?.label || "Admin";

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="admin-logo-icon">🎓</span>
            <span className="admin-logo-text">Study Notes</span>
          </Link>
          <div className="admin-badge">Admin</div>
        </div>

        <nav className="admin-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`admin-nav-item ${
                isActive(item.path) ? "active" : ""
              }`}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </Link>
          ))}
          <Button
            variant="ghost"
            size="xs"
            onClick={handleLogout}
            title="Logout"
            aria-label="Logout"
            className="admin-nav-item"
          >
            <SignOut title="Logout" />
          </Button>
        </nav>

        <div className="admin-sidebar-footer">
          <ThemeToggle
            variant="ghost"
            ariaLabel="Toggle theme"
            className="admin-themetoggler-btn"
          />
          <Link to="/" className="admin-back-link">
            👈 Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top Bar */}
        <header className="admin-topbar">
          <div className="admin-breadcrumbs">
            <span>Admin</span>
            <span className="admin-breadcrumb-separator">/</span>
            <span className="admin-breadcrumb-current">{pageTitle}</span>
          </div>

          <div className="admin-topbar-right">
            <div className="admin-user-info">
              <span className="admin-user-avatar">
                {user?.username?.charAt(0).toUpperCase() || "?"}
              </span>
              <span className="admin-user-name">{user?.username}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
};

export default AdminLayout;
