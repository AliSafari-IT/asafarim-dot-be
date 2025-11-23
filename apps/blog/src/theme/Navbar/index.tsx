import React from "react";
import { CentralNavbar, useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { useLocation } from "@docusaurus/router";
import OriginalNavbar from "@theme-original/Navbar";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import type { DocusaurusConfig } from "@docusaurus/types";
import "./Navbar.css";
import { isProduction } from "@asafarim/shared-ui-react";
import { PrelaunchNoticeBanner } from "@asafarim/shared-ui-react";

// Define your blog navigation links
const navLinks: NavLinkItem[] = [
  { to: "/blog", label: "Blog" },
  { to: "/docs/intro", label: "Docs" },
  { to: "/authors", label: "Authors" },
  { to: isProduction ? "https://www.asafarim.be/contact" : "http://web.asafarim.local:5175/contact", label: "Contact", external: true },
  { to: isProduction ? "https://www.asafarim.be/about" : "http://web.asafarim.local:5175/about", label: "About", external: true },
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
export default function NavbarWrapper(props: any): React.ReactElement {
  const authOptions = {
    authApiBase: isProduction
      ? "https://identity.asafarim.be/auth"
      : "http://identity.asafarim.local:5101/auth",
    meEndpoint: "/me",
    tokenEndpoint: "/token",
    logoutEndpoint: "/logout",
    identityLoginUrl: isProduction
      ? "https://identity.asafarim.be/login"
      : "http://identity.asafarim.local:5177/login"
  } as const;

  const { isAuthenticated, user, loading, signOut, signIn } = useAuth(authOptions);
  const { siteConfig } = useDocusaurusContext() as {
    siteConfig: DocusaurusConfig & {
      themeConfig: { navbar?: { logo?: { src?: string } } };
    };
  };

  return (
    <>
      <PrelaunchNoticeBanner />
      <CentralNavbar
        appId="blog"
        localLinks={navLinks}
        showAppSwitcher={true}
        brand={{
          text: siteConfig.title || "Blog",
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
        breakpoint={960} // Match the CSS media query 980
        mobileMenuBreakpoint={768}
        className="blog-navbar"
      />
      {/* Keep OriginalNavbar but hide it - some Docusaurus features might need it */}
      <div style={{ display: "none" }}>
        <OriginalNavbar {...props} />
      </div>
    </>
  );
}
