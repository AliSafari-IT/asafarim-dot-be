import { CentralNavbar, type NavLinkItem } from "@asafarim/shared-ui-react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@asafarim/shared-i18n";
import './navbar.css';

// Define your navigation links
const getNavLinks = (
  t: (key: string, options?: Record<string, string | number>) => string,
  isAuthenticated: boolean
): NavLinkItem[] => {
  const links: NavLinkItem[] = [
    // Always show portfolio link
    {
      to: "/portfolio",
      label: "Portfolio",
      external: false,
      icon: t('navbar.links.portfolio.icon'),
    },
    {
      to: "/showcases",
      label: "Showcases",
      external: false,
      icon: "✨",
    },
    { to: "/about", label: t('common:about'), external: false, icon: t('navbar.links.about.icon') },
    { to: "/contact", label: t('common:contact'), external: false, icon: t('navbar.links.contact.icon') },
  ];

  // Conditionally add admin link if authenticated
  if (isAuthenticated) {
    links.unshift({
      to: "/admin/entities/resumes",
      label: t('navbar.links.resumes.label'),
      external: false,
      icon: t('navbar.links.resumes.icon'),
    });
  }

  return links;
};

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
        {<span className="nav-link__icon">{link?.icon?.toString()}</span>}
        {link.label}
      </a>
    );
  }

  return (
    <a
      href={link.to}
      className={`nav-link ${isMobile ? "nav-link--mobile" : ""}`}
    >
      {<span className="nav-link__icon">{link?.icon?.toString()}</span>}
      {link.label}
    </a>
  );
};

export default function Navbar() {
  const appId = "web";
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  const { t } = useTranslation(appId);
  const navLinks = getNavLinks(t, isAuthenticated);

  return (
    <CentralNavbar
      appId={appId}
      showAppSwitcher={true}
      className="navbar"
      key="navbar"
      localLinks={navLinks}
      brand={{
        logo: "/logo.svg",
        text: t('navbar.brand.text'),
        href: "/",
      }}
      auth={{
        isAuthenticated,
        user,
        loading,
        onSignIn: signIn,
        onSignOut: signOut,
        labels: {
          notSignedIn: t('navbar.auth.notSignedIn'),
          signIn: t('navbar.auth.signIn'),
          signOut: t('navbar.auth.signOut'),
          welcome: (email?: string) => t('navbar.auth.welcome', { email: email || "User" }),
        },
      }}
      renderLink={(link, isMobile) => {
        return renderLink(link, isMobile);
      }}
      breakpoint={768}
      mobileMenuBreakpoint={520}
    />
  );
}
