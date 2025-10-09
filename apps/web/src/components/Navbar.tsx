import { CentralNavbar } from "@asafarim/shared-ui-react";
import { useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { Dropdown, DropdownDivider, DropdownItem } from "@asafarim/shared-ui-react";

// Define your navigation links
const navLinks: NavLinkItem[] = [
  { to: "#", label: "projects-dropdown", external: false, icon: "🚀" },
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
        if (link.label === "projects-dropdown") {
          return (
            <div className="navbar-item">
              <Dropdown
                placement="bottom-end"
                closeOnEscape={true}
                items={[
                  <DropdownItem
                    key="projects"
                    label="Projects"
                    icon="🚀"
                    onClick={() => (window.location.href = "http://web.asafarim.local:5175/projects")}
                  />,
                  <DropdownDivider key="divider-1" />,
                  <DropdownItem
                    key="npm-packages"
                    label="NPM Packages"
                    icon="📦"
                    onClick={() => (window.location.href = "https://www.npmjs.com/~asafarim")}
                  />,
                  <DropdownDivider key="divider-2" />,
                  <DropdownItem
                    key="skills"
                    label="Skills"
                    icon="💻"
                    onClick={() => (window.location.href = "http://web.asafarim.local:5175/skills")}
                  />,
                  <DropdownDivider key="divider-3" />,
                  <DropdownItem
                    key="portfolio"
                    label="Portfolio"
                    icon="📂"
                    onClick={() => (window.location.href = "http://web.asafarim.local:5175/portfolio")}
                  />,
                ]}
              >
                <button
                  className={`nav-link ${isMobile ? "nav-link--mobile" : ""}`}
                  aria-label="Open projects menu"
                >
                  Projects
                </button>
              </Dropdown>
            </div>
          );
        }
        return renderLink(link, isMobile);
      }}
      breakpoint={768}
      mobileMenuBreakpoint={520}
    />
  );
}
