import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@asafarim/shared-ui-react";
import { ThemeToggle } from "@asafarim/react-themes";

interface DashboardLayoutProps {
  children: ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/clients", icon: "👥", label: "Clients" },
    { path: "/proposals", icon: "📄", label: "Proposals" },
    { path: "/invoices", icon: "💰", label: "Invoices" },
    { path: "/calendar", icon: "📅", label: "Calendar" },
  ];

  const handleLogout = () => {
    signOut(window.location.origin);
  };

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "var(--surface-base)",
      }}
    >
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "250px" : "60px",
          backgroundColor: "var(--surface-raised)",
          borderRight: "1px solid var(--border-subtle)",
          transition: "width 0.3s",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Logo */}
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.5rem" }}>💼</span>
          {sidebarOpen && (
            <span
              style={{
                fontWeight: 600,
                fontSize: "1.125rem",
                color: "var(--text-primary)",
              }}
            >
              Freelance Toolkit
            </span>
          )}

          {/* Toggle Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: "0.75rem",
              margin: "0.5rem",
              backgroundColor: "transparent",
              border: "1px solid var(--border-subtle)",
              borderRadius: "0.5rem",
              cursor: "pointer",
              color: "var(--text-secondary)",
              zIndex: 100,
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "1rem 0" }}>
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              location.pathname.startsWith(item.path + "/");
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  padding: "0.75rem 1rem",
                  margin: "0.25rem 0.5rem",
                  borderRadius: "0.5rem",
                  textDecoration: "none",
                  color: isActive
                    ? "var(--text-primary)"
                    : "var(--text-secondary)",
                  backgroundColor: isActive
                    ? "var(--surface-sunken)"
                    : "transparent",
                  fontWeight: isActive ? 600 : 400,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor =
                      "var(--surface-sunken)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <span style={{ fontSize: "1.25rem" }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            padding: "0.75rem",
            margin: "0.5rem",
            backgroundColor: "transparent",
            border: "1px solid var(--border-subtle)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          {sidebarOpen ? "◀" : "▶"}
        </button>
      </aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            height: "64px",
            backgroundColor: "var(--surface-raised)",
            borderBottom: "1px solid var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 2rem",
          }}
        >
          <h1
            style={{
              fontSize: "1.25rem",
              fontWeight: 600,
              color: "var(--text-primary)",
              margin: 0,
            }}
          >
            {navItems.find((item) => location.pathname.startsWith(item.path))
              ?.label || "Freelance Toolkit"}
          </h1>

          {/* User Menu */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <span
              style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}
            >
              {user?.email || user?.userName || "User"}
            </span>
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: "var(--surface-sunken)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "0.375rem",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontSize: "0.875rem",
              }}
            >
              Logout
            </button>
            <ThemeToggle />
          </div>
        </header>

        {/* Page Content */}
        <main
          style={{
            flex: 1,
            padding: "2rem",
            overflowY: "auto",
          }}
        >
          {children}
        </main>
      </div>
    </div>
  );
};
