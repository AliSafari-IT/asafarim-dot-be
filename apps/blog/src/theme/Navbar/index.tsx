import React from "react";
import { CentralNavbar, useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { useLocation } from "@docusaurus/router";
import OriginalNavbar from "@theme-original/Navbar";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { DocusaurusConfig } from "@docusaurus/types";
import "./Navbar.css";

// Define your blog navigation links
const navLinks: NavLinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/blog", label: "Blog" },
  { to: "/docs/intro", label: "Docs" },
  { to: "http://web.asafarim.local:5175/contact", label: "Contact", external: true },
  // Add more links as needed
];

// Custom render function for Docusaurus links
const renderLink = (link: NavLinkItem, isMobile = false) => {
  const location = useLocation();
  const isActive = location.pathname.startsWith(link.to);

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
    <a
      href={link.to}
      className={`nav-link ${isMobile ? "nav-link--mobile" : ""} ${
        isActive ? "nav-link--active" : ""
      }`}
    >
      {link.icon && <span className="nav-link__icon">{link.icon}</span>}
      {link.label}
    </a>
  );
};
export default function NavbarWrapper(props): React.ReactElement {
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  const { siteConfig } = useDocusaurusContext() as {
    siteConfig: DocusaurusConfig & {
      themeConfig: { navbar?: { logo?: { src?: string } } };
    };
  };

  return (
    <>
      <CentralNavbar
        localLinks={navLinks}
        showAppSwitcher={true}
        brand={{
          text: siteConfig.title,
          href: "/",
          logo: siteConfig.themeConfig?.navbar?.logo?.src,
        }}
        auth={{
          isAuthenticated,
          user,
          loading,
          onSignIn: (returnUrl) =>
            signIn(returnUrl || window.location.pathname),
          onSignOut: signOut,
          labels: {
            notSignedIn: "Not signed in",
            signIn: "Sign In",
            signOut: "Sign Out",
            welcome: (email?: string) => `Welcome ${email ?? "User"}!`,
          },
        }}
        renderLink={renderLink}
        breakpoint={996} // Docusaurus default breakpoint for mobile menu
        mobileMenuBreakpoint={576}
        className="blog-navbar"
      />
      {/* Keep OriginalNavbar but hide it - some Docusaurus features might need it */}
      <div style={{ display: "none" }}>
        <OriginalNavbar {...props} />
      </div>
    </>
  );
}
