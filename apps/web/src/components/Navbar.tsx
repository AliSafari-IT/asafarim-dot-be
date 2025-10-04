import { CentralNavbar } from "@asafarim/shared-ui-react";
import { useAuth } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";
import DDMenu, { DDMenuWrapper } from "@asafarim/dd-menu";
import "@asafarim/dd-menu/index.css";

// Define your navigation links
const navLinks: NavLinkItem[] = [
  { to: "#", label: "projects-dropdown" }, 
  { to: "/admin/entities/resumes", label: "Resumes" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
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
        {link.icon && <span className="nav-link__icon">{link.icon}</span>}
        {link.label}
      </a>
    );
  }

  return (
    <NavLink
      to={link.to}
      className={({ isActive }) =>
        `nav-link ${isMobile ? "nav-link--mobile" : ""} ${
          isActive ? "nav-link--active" : ""
        }`
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
              <DDMenuWrapper
                key="projects-dropdown"
                children={
                  <DDMenu
                    className={`nav-link ${isMobile ? "nav-link--mobile" : ""}`}
                    trigger={<span>Projects</span>}
                    variant="minimal"
                    placement="bottom-start"
                    items={[
                      {
                        id: "projects",
                        label: "Projects",
                        link: "/projects",
                        icon: "🚀",
                      },
                      {
                        id: "npm-packages",
                        label: "NPM Packages",
                        link: "https://www.npmjs.com/~asafarim",
                        icon: "📦",
                      },
                      {
                        id: "skills",
                        label: "Skills",
                        link: "/skills",
                        icon: "💻",
                      },
                      {
                        id: "portfolio",
                        label: "Portfolio",
                        link: "/portfolio",
                        icon: "📂",
                      },
                    ]}
                  />
                }
              />
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
