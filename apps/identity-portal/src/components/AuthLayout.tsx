import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "@asafarim/react-themes";
import "./auth-layout.css";
import { AuthStatus } from "@asafarim/shared-ui-react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

const userMenuItems = [
  { label: "Home", value: "http://web.asafarim.local:5175/" },
  { label: "About", value: "http://web.asafarim.local:5175/about" },
  { label: "Contact", value: "http://web.asafarim.local:5175/contact" },
  { label: "Sign In", value: "/login" },
  { label: "Sign Up", value: "/register" },
  { label: "Blog", value: "http://blog.asafarim.local:3000" },
  { label: "Web App", value: "http://web.asafarim.local:5175" },
  { label: "Dashboard", value: "/dashboard" },
];

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  const { isAuthenticated, user, logout} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname; // e.g. '/admin/users'
  const [ddPlaceholder, setDdPlaceholder] = useState<string>("User Menu");
  const [menuItems, setMenuItems] =
    useState<{ label: string; value: string }[]>(userMenuItems);
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (
      user?.roles?.some(
        (role) =>
          role === "Admin" ||
          role === "SuperAdmin" ||
          role === "admin" ||
          role === "superadmin"
      )
    ) {
      const adminMenuItems = [
        { label: "Admin Users", value: "/admin/users" },
        { label: "User Profile", value: "/admin/user-profile" },
      ];
      // add admin menu items to the beginning of the menu items
      setMenuItems([
        ...adminMenuItems,
        ...userMenuItems.filter(
          (item) =>
            !adminMenuItems.some((adminItem) => adminItem.value === item.value)
        ),
      ]);
    } else {
      setMenuItems(userMenuItems);
    }
  }, [user]);

  useEffect(() => {
    // Keep all items so the control can resolve and show the current label reliably
    setMenuItems(userMenuItems);

    const computePlaceholder = () => {
      const isNarrow = window.innerWidth <= 640;
      setDdPlaceholder(
        isNarrow
          ? "Menu"
          : userMenuItems.find((item) => item.value === currentPath)?.label ||
              "User Menu"
      );
    };

    computePlaceholder();
    window.addEventListener("resize", computePlaceholder);
    return () => window.removeEventListener("resize", computePlaceholder);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | Event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <div className="auth-container">
      <div className="auth-header">
        <div className="auth-header-content">
          <Link to="/" className="auth-logo">
            <img src="/logo.svg" alt="ASafariM Logo" width="40" height="40" />
            <span>ASafariM Identity</span>
          </Link>
          <div className="user-profile-actions">
            <AuthStatus
              isAuthenticated={isAuthenticated}
              user={user}
              onSignOut={async () => await logout()}
              labels={{
                notSignedIn: "Not signed in",
                signIn: "Sign In",
                signOut: "Sign Out",
                welcome: (email?: string) => `Welcome ${email ?? "User"}!`,
              }}
            />
            <ThemeToggle
              size="lg"
              style={{
                border: "none",
                backgroundColor: "transparent",
                marginLeft: "10px",
              }}
            />
            <div className="nav-dropdown" ref={dropdownRef}>
              <button
                type="button"
                className="nav-dropdown-button"
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                onClick={() => setMenuOpen((o) => !o)}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") setMenuOpen(true);
                  if (e.key === "Escape") setMenuOpen(false);
                }}
              >
                <span className="nav-dropdown-label">{ddPlaceholder}</span>
                <span className="nav-dropdown-chevron" aria-hidden>
                  ▾
                </span>
              </button>
              {menuOpen && (
                <ul className="nav-dropdown-menu" role="menu">
                  {menuItems
                    .filter((it) => it.value !== currentPath)
                    .map((it) => (
                      <li key={it.value} role="menuitem">
                        <button
                          type="button"
                          className="nav-dropdown-item"
                          onClick={() => {
                            setMenuOpen(false);
                            // Check if it's an external URL (starts with http)
                            if (it.value.startsWith("http")) {
                              window.location.href = it.value;
                            } else {
                              navigate(it.value);
                            }
                          }}
                        >
                          {it.label}
                        </button>
                      </li>
                    ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="auth-card">
        <div className="auth-card-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>

        <div className="auth-card-content">{children}</div>
      </div>

      <div className="auth-footer">
        <p>&copy; {new Date().getFullYear()} ASafariM. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthLayout;
