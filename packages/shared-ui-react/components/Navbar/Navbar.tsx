import React, { useState, useEffect } from 'react';
import AuthStatus from '../Auth/AuthStatus';
import { ThemeToggle } from '@asafarim/react-themes';
import type { NavbarProps, NavLinkItem } from './types';
import './Navbar.css';
import { LanguageSwitcher } from '../LanguageSwitcher';

const defaultRenderLink = (link: NavLinkItem, isMobile = false): React.ReactNode => {
  if (link.external) {
    return (
      <a
        href={link.to}
        target="_blank"
        rel="noopener noreferrer"
        className={`nav-link ${isMobile ? 'nav-link--mobile' : ''}`}
        data-nav-link="true"
      >
        {link.icon && <span className="nav-link__icon">{link.icon}</span>}
        {link.label}
      </a>
    );
  }
  
  return (
    <a
      href={link.to}
      className={`nav-link ${isMobile ? 'nav-link--mobile' : ''}`}
      data-nav-link="true"
      {...(link.to === '#' ? { 'data-keep-menu-open': 'true' } : {})}
    >
      {link.icon && <span className="nav-link__icon">{link.icon}</span>}
      {link.label}
    </a>
  );
};

const defaultRenderBrand = (brand: { logo?: string; text: string; href?: string }): React.ReactNode => (
  <a href={brand?.href || '/'} className="brand" aria-label="Home">
    {brand.logo && <img src={brand.logo} alt="logo" className="brand__logo" />}
    <span className="brand__text">{brand.text}</span>
  </a>
);

export const Navbar = ({
  localLinks: links,
  brand,
  breakpoint = 768,
  mobileMenuBreakpoint = 520,
  className = '',
  auth,
  renderLink = defaultRenderLink,
  renderBrand = defaultRenderBrand,
}: NavbarProps): React.ReactNode => {
  const [open, setOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth >= breakpoint) setOpen(false);
    };

    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [breakpoint]);

  const Links = ({ vertical = false }: { vertical?: boolean }) => (
    <ul
      className={`nav-list ${vertical ? 'nav-list--vertical' : ''}`}
      role="list"
    >
      {links?.map((link, index) => (
        <li
          key={index}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.closest('[data-keep-menu-open]')) return;

            const anchor = target.closest('a');
            const href = anchor?.getAttribute('href') || '';
            const isRealNav = !!anchor && href !== '#' && href !== '';
            if (isRealNav) setOpen(false);
          }}
        >
          {renderLink(link, vertical)}
        </li>
      ))}
    </ul>
  );

  const showAuthInHeader = windowWidth >= mobileMenuBreakpoint;
  const showAuthInMenu = windowWidth < mobileMenuBreakpoint;

  return (
    <nav className={`nav-root ${className}`} aria-label="Primary">
      <div className="nav-wrap">
        <div className="nav-row">
          {/* Left: brand */}
          {renderBrand({logo: brand?.logo, text: `${brand?.text}`, href: brand?.href})}

          {/* Center: links (desktop only) */}
          <div className="nav-center">
            <Links />
          </div>

          {/* Right: theme + hamburger */}
          <div className="nav-right align-middle">
            {/* Auth status in header (hidden on mobile when menu is open) */}
            {auth && showAuthInHeader && (
              <AuthStatus
                isAuthenticated={auth.isAuthenticated}
                user={auth.user}
                loading={auth.loading}
                labels={auth.labels}
                onSignIn={auth.onSignIn}
                onSignOut={auth.onSignOut}
              />
            )}
            
            <div className={`theme-in-header ${open ? 'is-hidden' : ''}`}>
              <LanguageSwitcher variant="dropdown" />
              <ThemeToggle className="navbar-theme-toggle" />
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
              <span className={`hamburger__bar ${open ? 'x1' : ''}`} />
              <span className={`hamburger__bar ${open ? 'x2' : ''}`} />
              <span className={`hamburger__bar ${open ? 'x3' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div id="mobile-menu" className={`mobile-menu ${open ? 'open' : ''}`}>
        <div className="mobile-inner">
          <Links vertical />
          <div className="theme-in-menu">
            <ThemeToggle className="navbar-theme-toggle" />
            {auth && showAuthInMenu && (
              <AuthStatus
                isAuthenticated={auth.isAuthenticated}
                user={auth.user}
                loading={auth.loading}
                labels={{
                  notSignedIn: '',
                  ...auth.labels,
                }}
                onSignIn={auth.onSignIn}
                onSignOut={auth.onSignOut}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
