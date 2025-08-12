// Navbar.tsx
import { ThemeToggle } from "@asafarim/react-themes";
import { HeaderContainer } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const navbar = (
    <ul className="flex gap-md navbar-items" role="list">
      <li>
        <NavLink
          to="/about"
          className={({ isActive }) =>
            isActive ? "text-primary" : "text-foreground"
          }
        >
          About
        </NavLink>
      </li>
      <li>
        <NavLink
          to="/contact"
          className={({ isActive }) =>
            isActive ? "text-primary" : "text-foreground"
          }
        >
          Contact
        </NavLink>
      </li>
    </ul>
  );

  return (
    <nav className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-content">
          <div className="left-aligned">
            <NavLink to="/" className="navbar-logo">
              <div className="navbar-brand">
                <img
                  className="logo navbar-logo-img"
                  src="/logo.svg"
                  alt="ASafariM"
                  title="ASafariM"
                />
                <span className="logo navbar-logo-text">ASafariM</span>
              </div>
            </NavLink>
          </div>
          <div className="center-aligned">
            <HeaderContainer navbar={navbar} />
          </div>
          <div className="right-aligned">
            <ThemeToggle showLabels={false} />
          </div>
        </div>
      </div>
    </nav>
  );
}
