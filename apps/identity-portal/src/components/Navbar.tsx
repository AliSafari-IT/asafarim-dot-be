import { CentralNavbar } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Define navigation links for Identity Portal
const navLinks: NavLinkItem[] = [
  { to: "/admin/users", label: "Users" },
  { to: "/me", label: "My Profile" },
  // External example (docs, etc.)
  // { to: "https://example.com/docs", label: "Docs", external: true }
];

// Custom render function for React Router links
const renderLink = (link: NavLinkItem, isMobile = false) => {
  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        className={`nav-link ${isMobile ? "nav-link--mobile" : ""}`}
      >
        {link.icon && <span className="nav-link__icon">{link.icon}</span>}
        {link.label}
      </a>
    );
  }

  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        `nav-link ${isMobile ? "nav-link--mobile" : ""} ${
          isActive ? "nav-link--active" : ""
        }`
      }
      end={link.to === "/"}
    >
      {link.icon && <span className="nav-link__icon">{link.icon}</span>}
      {link.label}
    </NavLink>
  );
};

export default function Navbar() {
  const { isAuthenticated, user, loading, signOut } = useAuth();

  // Create a signIn function that matches the shared-ui-react interface
  const signIn = () => {
    window.location.href = "/login";
  };

  // Adapt user object to match the expected format for CentralNavbar
  const adaptedUser = user
    ? {
        ...user,
        name: user.firstName || user.userName || user.name,
        email: user.email,
      }
    : undefined;

  console.log("[Navbar] Auth state:", {
    isAuthenticated,
    user: adaptedUser,
    loading,
  });

  return (
    <CentralNavbar
      appId="identity-portal"
      localLinks={navLinks}
      brand={{
        logo: "/logo.svg",
        text: "AuthGate",
        href: "/dashboard",
      }}
      auth={{
        isAuthenticated,
        user: adaptedUser,
        loading,
        onSignIn: signIn,
        onSignOut: signOut,
        labels: {
          notSignedIn: "Not signed in",
          signIn: "Sign In",
          signOut: "Sign Out",
          welcome: (email?: string) => `Welcome ${email || "User"}`,
        },
      }}
      renderLink={renderLink}
      breakpoint={768}
      mobileMenuBreakpoint={520}
    />
  );
}
