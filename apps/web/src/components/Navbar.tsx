import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "@asafarim/react-themes";
import {
  AuthStatus,
  HeaderContainer,
  useAuth,
} from "@asafarim/shared-ui-react";

const BREAKPOINT = 768;
const MOBILE_MENU_BREAKPOINT = 520;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, user, loading, signOut, signIn } = useAuth();
  // current window width
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Close the mobile menu if we jump to desktop layout
  useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= BREAKPOINT) setOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const Links = ({ vertical = false }: { vertical?: boolean }) => (
    <ul
      className={vertical ? "nav-list nav-list--vertical" : "nav-list"}
      role="list"
    >
      <li>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "nav-link nav-link--active" : "nav-link"
          }
          onClick={() => setOpen(false)}
        >
          About
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "nav-link nav-link--active" : "nav-link"
          }
          onClick={() => setOpen(false)}
        >
          Contact
        </NavLink>
      </li>
    </ul>
  );

  return (
    <HeaderContainer
      navbar={
        <nav className="nav-root" aria-label="Primary">
          <div className="nav-wrap">
            <div className="nav-row">
              {/* Left: brand */}
              <a href="/" className="brand" aria-label="Home">
                <img src="/logo.svg" alt="" className="brand__logo" />
                <span className="brand__text">ASafariM</span>
              </a>

              {/* Center: links (desktop only) */}
              <div className="nav-center">
                <Links />
              </div>

              {/* Right: theme + hamburger */}
              <div className="nav-right">
                {/* Theme toggle in header (hidden on mobile when menu is open) */}
                {windowWidth >= MOBILE_MENU_BREAKPOINT && (
                  <AuthStatus
                    isAuthenticated={isAuthenticated}
                    user={user}
                    loading={loading}
                    labels={{
                      notSignedIn: "Not signed in!",
                    }}
                    onSignIn={(returnUrl) => signIn(returnUrl)}
                    onSignOut={() => signOut()}
                  />
                )}
                <div className={`theme-in-header ${open ? "is-hidden" : ""}`}>
                  <ThemeToggle
                    showLabels={false}
                    style={{
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>
                {/* Hamburger (mobile only) */}
                <button
                  className="hamburger"
                  type="button"
                  aria-label="Toggle menu"
                  aria-expanded={open}
                  aria-controls="mobile-menu"
                  onClick={() => setOpen((v) => !v)}
                >
                  <span className={`hamburger__bar ${open ? "x1" : ""}`} />
                  <span className={`hamburger__bar ${open ? "x2" : ""}`} />
                  <span className={`hamburger__bar ${open ? "x3" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile dropdown */}
          <div id="mobile-menu" className={`mobile-menu ${open ? "open" : ""}`}>
            <div className="mobile-inner">
              <Links vertical />
              <div className="theme-in-menu">
                <ThemeToggle
                  showLabels={false}
                  style={{
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
                {windowWidth < MOBILE_MENU_BREAKPOINT && (
                  <AuthStatus
                    isAuthenticated={isAuthenticated}
                    user={user}
                    loading={loading}
                    labels={{
                      notSignedIn: "",
                    }}
                    onSignIn={(returnUrl) => signIn(returnUrl)}
                    onSignOut={() => signOut()}
                  />
                )}
              </div>
            </div>
          </div>
        </nav>
      }
    />
  );
}
