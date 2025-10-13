import { useState, useEffect } from "react";
import Navbar from "./Navbar";
import type { NavLinkItem, NavbarProps } from "./types";
import { getAppRegistry, getCurrentAppId, getAppById } from "./appRegistry";
import "./CentralNavbar.css";

const CentralNavbar = ({
  localLinks = [],
  appId: providedAppId,
  showAppSwitcher = true,
  auth,
  className = "",
  breakpoint = 768,
  mobileMenuBreakpoint = 520,
  renderLink,
  brand,
} : NavbarProps) => {
  const [appSwitcherOpen, setAppSwitcherOpen] = useState(false);

  // Auto-detect current app if not provided
  const currentAppId = providedAppId || getCurrentAppId();
  const currentApp = getAppById(currentAppId);
  // Resolve the shared package default logo at build time (works in Vite/ESM)
  // Path from components/Navbar/CentralNavbar.tsx -> ./logo.svg
  const defaultLogo = brand?.logo;

  // Combine local links with app switcher
  const combinedLinks: NavLinkItem[] = [
    ...(showAppSwitcher
      ? [
          {
            to: "#",
            label: "Apps",
            icon: (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="currentColor"
              >
                <path d="M1 1h6v6H1V1zm8 0h6v6H9V1zM1 9h6v6H1V9zm8 0h6v6H9V9z" />
              </svg>
            ),
            external: false,
          },
        ]
      : []),
    ...localLinks,
  ];

  // Custom render function that handles the app switcher
  const handleRenderLink = (link: NavLinkItem, isMobile = false) => {
    // Handle app switcher dropdown
    if (link.label === "Apps") {
      return (
        <div className="app-switcher-container">
          <button
            className={`app-switcher-button ${appSwitcherOpen ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              setAppSwitcherOpen(!appSwitcherOpen);
            }}
          >
            {link.icon && <span className="nav-link__icon">{link.icon}</span>}
            {link.label}
            <svg
              className={`app-switcher-caret ${appSwitcherOpen ? "open" : ""}`}
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="currentColor"
            >
              <path
                d="M1 1l4 4 4-4"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
              />
            </svg>
          </button>

          {appSwitcherOpen && (
            <div className="app-switcher-dropdown">
              <div className="app-switcher-dropdown-inner">
                {getAppRegistry()
                  .filter((app) => app.id !== currentAppId) // Don't show current app
                  .map((app, index) => (
                    <a
                      key={index}
                      href={app.url}
                      className="app-switcher-item"
                      onClick={() => setAppSwitcherOpen(false)}
                    >
                      {app.icon && (
                        <span className="app-switcher-item-icon">
                          {app.icon}
                        </span>
                      )}
                      <div className="app-switcher-item-content">
                        <div className="app-switcher-item-name">{app.name}</div>
                        {app.description && (
                          <div className="app-switcher-item-description">
                            {app.description}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
              </div>
            </div>
          )}
        </div>
      );
    }

    // Use provided renderLink for other links if available
    if (renderLink) {
      return renderLink(link, isMobile);
    }

    // Default rendering
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
        className={`nav-link ${isMobile ? "nav-link--mobile" : ""}`}
      >
        {link.icon && <span className="nav-link__icon">{link.icon}</span>}
        {link.label}
      </a>
    );
  };

  // Close app switcher when clicking outside
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest(".app-switcher-container") && appSwitcherOpen) {
        setAppSwitcherOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [appSwitcherOpen]);

  return (
    <Navbar
      appId={currentAppId}
      localLinks={combinedLinks}
      brand={
        currentApp
          ? {
              text: currentApp.name,
              href: currentApp.url,
              logo: currentApp.logo ?? defaultLogo,
            }
          : {
              text: "ASafariM",
              logo: defaultLogo,
            }
      }
      auth={auth}
      className={`central-navbar ${className}`}
      breakpoint={breakpoint}
      mobileMenuBreakpoint={mobileMenuBreakpoint}
      renderLink={handleRenderLink}
    />
  );
};

export default CentralNavbar;
