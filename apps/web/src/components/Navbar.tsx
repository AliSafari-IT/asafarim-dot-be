import { CentralNavbar } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { useAuth } from "../hooks/useAuth";

// Define your navigation links
const navLinks: NavLinkItem[] = [
  {
    to: "/admin/entities/resumes",
    label: "Resumes",
    external: false,
    icon: "📄",
  },
  { to: "/about", label: "About", external: false, icon: "❓" },
  { to: "/contact", label: "Contact", external: false, icon: "📞" },
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

  return (
    <CentralNavbar
      appId="web"
      showAppSwitcher={false}
      className="navbar"
      key="navbar"
      localLinks={navLinks}
      brand={{
        logo: "/logo.svg",
        text: "ASafariM",
        href: "/dashboard",
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
          welcome: (email?: string) => `Welcome ${email || "User"}!`,
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
