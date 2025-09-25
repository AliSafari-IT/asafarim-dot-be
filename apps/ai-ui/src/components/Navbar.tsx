import { CentralNavbar } from "@asafarim/shared-ui-react";
import { useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";
import { isProduction } from "@asafarim/shared-ui-react";

// Define your navigation links
const navLinks: NavLinkItem[] = [
  {
    to: isProduction ? "https://www.asafarim.be/contact" : "http://web.asafarim.local:5175/contact",
    label: "Contact",
  },
  {
    to: isProduction ? "https://www.asafarim.be/about" : "http://web.asafarim.local:5175/about",
    label: "About",
  },
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
      end={link.to === "/"} // Only match exactly for home link
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
        text: "ASafariM",
        href: "/"
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
          welcome: (email?: string) => `Welcome ${user?.username ||email || 'User'}!`
        }
      }}
      renderLink={renderLink}
      breakpoint={768}
      mobileMenuBreakpoint={520}
    />
  );
}
