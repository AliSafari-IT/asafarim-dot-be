// apps/test-automation-ui/src/components/Navbar.tsx
import { useState, useEffect } from "react";
import { CentralNavbar, isProduction, useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink, useLocation } from "react-router-dom";
import "./Navbar.css";

// Define navigation links for Test Automation Platform
const navLinks: NavLinkItem[] = [
  {
    to: "/dashboard",
    label: "Summary",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2zm12-6h2v8h-2V9zm0 10h2v2h-2v-2z" />
      </svg>
    ),
  },
  {
    to: "/run",
    label: "Run Tests",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
      </svg>
    ),
  },
  {
    to: "/functional-requirements",
    label: "Requirements",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 5h14v2H7V5zm0 4h14v2H7V9zm0 4h10v2H7v-2zm0 4h6v2H7v-2zM3 5h2v2H3V5zm0 4h2v2H3V9zm0 4h2v2H3v-2zm0 4h2v2H3v-2z" />
      </svg>
    ),
  },
  {
    to: "/fixtures",
    label: "Fixtures",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2l1.09 3.26L17 5.09l-2.91 1.17L15.82 11l-3.82-2.26L8.18 11l.73-4.74L5 5.09l3.91-.83L12 2zm0 8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm8 6v2H4v-2h16z" />
      </svg>
    ),
  },
  {
    to: "/test-suites",
    label: "Test Suites",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M4 4h16v16H4V4zm2 2v12h12V6H6zm2 2h8v2H8V8zm0 4h8v2H8v-2zm0 4h4v2H8v-2zm12-8h2v12h-2V8z" />
      </svg>
    ),
  },
  {
    to: "/test-cases",
    label: "Test Cases",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M7 7h10v2H7V7zm0 4h10v2H7v-2zm0 4h6v2H7v-2zm-4 0l2.5 2.5L4.5 18 3 16.5l2.5-2.5zM3 11.5L5.5 14 7 12.5 5.5 11 3 11.5z" />
      </svg>
    ),
  },
  {
    to: "/test-data-sets",
    label: "Data Sets",
    icon: (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M5 4h14v3H5V4zm0 5h14v3H5V9zm0 5h14v3H5v-3zM3 4h2v3H3V4zm0 5h2v3H3V9zm0 5h2v3H3v-3z" />
      </svg>
    ),
  },
];

// Custom render function for React Router links
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
      end={link.to === "/dashboard"}
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
  // Use Identity API directly for authentication
  const authApiBase = isProduction 
    ? 'https://identity.asafarim.be/auth' 
    : 'http://identity.asafarim.local:5101/auth';

  const { isAuthenticated, user, loading, signOut, signIn} = useAuth({
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
        appId="testora"
        localLinks={navLinks}
        brand={{
          logo: "/logo.svg",
          text: "Testora",
          href: "/dashboard",
        }}
        auth={{
          isAuthenticated,
          user,
          loading,
          onSignIn: (returnUrl) =>
            signIn(returnUrl || window.location.pathname),
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
        className="test-automation-navbar"
      />
    </header>
  );
}