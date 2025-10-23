import { useState, useEffect } from "react";
import { CentralNavbar, isProduction, useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

// Define your navigation links with optional icons and accessibility labels
const navLinks: NavLinkItem[] = [
  {
    to: "/admin/users",
    label: "Users",
  },
  {
    to: "/me",
    label: "My Profile",
  },
  {
    to: isProduction ? "https://www.asafarim.be/contact" : "http://web.asafarim.local:5175/contact",
    label: "Contact",
  },
  {
    to: isProduction ? "https://www.asafarim.be/about" : "http://web.asafarim.local:5175/about",
    label: "About",
  },
];

// Custom render function for React Router links with better accessibility
const renderLink = (link: NavLinkItem, isMobile = false) => {
  const baseClasses = `nav-link ${isMobile ? "nav-link--mobile" : ""}`;
  const activeClass = "nav-link--active";
  const icon = link.icon && (
    <span className="nav-link__icon" aria-hidden="true">
      {link.icon}
    </span>
  );

  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        aria-label={link.label}
      >
        {icon}
        {link.label}
      </a>
    );
  }

  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        `${baseClasses} ${isActive ? activeClass : ""}`
      }
      end={link.to === "/"}
      aria-label={link.label}
    >
      {icon}
      {link.label}
    </NavLink>
  );
};

// Track if the mobile menu is open
const useMobileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return { isOpen };
};

export default function Navbar() {
  // Use Identity API directly for authentication (not proxied)
  const authApiBase = isProduction ? 'https://identity.asafarim.be/auth' : 'http://identity.asafarim.local:5101/auth';

  const { isAuthenticated, user, loading, signOut, signIn } = useAuth({
    authApiBase,
    meEndpoint: '/me',
    tokenEndpoint: '/token',
    logoutEndpoint: '/logout'
  });

  const { isOpen } = useMobileMenu();
  const [scrolled, setScrolled] = useState(false);

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  return (
    <header
      className={`app-header ${scrolled ? "scrolled" : ""} ${
        isOpen ? "mobile-menu-open" : ""
      }`}
      role="banner"
    >
      <CentralNavbar
        appId="identity-portal"
        localLinks={navLinks}
        brand={{
          logo: "/logo.svg",
          text: "Identity Portal",
          href: "/",
        }}
        auth={{
          isAuthenticated,
          user,
          loading,
          onSignIn: signIn,
          onSignOut: signOut,
          labels: {
            notSignedIn: "Not signed in!",
            signIn: "Sign In",
            signOut: "Sign Out",
            welcome: (email?: string) => `Welcome, ${email || "User"}!`,
          },
        }}
        renderLink={renderLink}
        breakpoint={992} // Desktop breakpoint
        mobileMenuBreakpoint={768} // Tablet breakpoint
        className="identity-portal-navbar"
      />
    </header>
  );
}
