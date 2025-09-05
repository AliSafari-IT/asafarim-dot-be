import { CentralNavbar, useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";

// Define navigation links for Identity Portal
const navLinks: NavLinkItem[] = [
  { to: "/dashboard", label: "Dashboard" },
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
        className={`nav-link ${isMobile ? 'nav-link--mobile' : ''}`}
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
        `nav-link ${isMobile ? 'nav-link--mobile' : ''} ${isActive ? 'nav-link--active' : ''}`
      }
      end={link.to === "/"}
    >
      {link.icon && <span className="nav-link__icon">{link.icon}</span>}
      {link.label}
    </NavLink>
  );
};

export default function Navbar() {
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();

  return (
    <CentralNavbar
      localLinks={navLinks}
      brand={{
        logo: "/logo.svg",
        text: "Identity Portal",
        href: "/dashboard",
      }}
      auth={{
        isAuthenticated,
        user,
        loading,
        onSignIn: signIn,
        onSignOut: signOut,
        labels: {
          notSignedIn: "Not signed in",
          signIn: "Sign In",
          signOut: "Sign Out",
          welcome: (email?: string) => `Welcome ${email || 'User'}`,
        },
      }}
      renderLink={renderLink}
      breakpoint={768}
      mobileMenuBreakpoint={520}
    />
  );
}
