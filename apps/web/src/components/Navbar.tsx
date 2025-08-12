// Navbar.tsx
import { ThemeToggle } from "@asafarim/react-themes";
import { HeaderContainer } from "@asafarim/shared-ui-react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const navbar = (
    <ul className="flex gap-md">
      <li>
        <NavLink
          to="/"
          className={({ isActive }) =>
            isActive ? "text-primary" : "text-foreground"
          }
        >
          Home
        </NavLink>
      </li>
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
          <div className="navbar-brand">
            <div className="navbar-logo left-aligned">
              <img
                className="navbar-logo-img"
                src="/logo.svg"
                alt="ASafariM"
                title="ASafariM"
              />
            </div>
            <div className="center-aligned">
              <HeaderContainer navbar={navbar} />
            </div>
            <div className="right-aligned">
              <ThemeToggle showLabels={false} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
