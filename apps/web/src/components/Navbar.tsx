import { CentralNavbar } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { useAuth } from "../hooks/useAuth";
import { useTranslation } from "@asafarim/shared-i18n";

// Define your navigation links
const getNavLinks = (t: (key: string, options?: Record<string, string | number>) => string): NavLinkItem[] => [
  {
    to: "/admin/entities/resumes",
    label: t('navbar.links.resumes.label'),
    external: false,
    icon: t('navbar.links.resumes.icon'),
  },
  { to: "/about", label: t('common:about'), external: false, icon: "❓" },
  { to: "/contact", label: t('common:contact'), external: false, icon: "📞" },
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
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  const { t } = useTranslation('web');
  const navLinks = getNavLinks(t);

  return (
    <CentralNavbar
      appId="web"
      showAppSwitcher={true}
      className="navbar"
      key="navbar"
      localLinks={navLinks}
      brand={{
        logo: "/logo.svg",
        text: t('navbar.brand.text'),
        href: "/dashboard",
      }}
      auth={{
        isAuthenticated,
        user,
        loading,
        onSignIn: signIn,
        onSignOut: signOut,
        labels: {
          notSignedIn: t('common:notSignedIn', { defaultValue: "Not signed in!" }),
          signIn: t('common:signIn'),
          signOut: t('common:signOut'),
          welcome: (email?: string) => t('common:welcome', { email: email || "User" }),
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
