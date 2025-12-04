import type { ReactNode } from 'react';

export interface NavLinkItem {
  to: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
}

export interface NavbarProps {
  /**
 * Current application ID (will be auto-detected if not provided)
 */
  appId: string;

  /**
   * Whether to show the app switcher dropdown
   * @default true
   */
  showAppSwitcher?: boolean;

  /**
   * Array of navigation links to display in the navbar
   */
  localLinks?: NavLinkItem[];
  /**
   * Brand/logo to display on the left side
   */
  brand?: {
    logo?: string;
    text: string;
    href?: string;
  };
  /**
   * Breakpoint at which the mobile menu appears (in pixels)
   * @default 768
   */
  breakpoint?: number;
  /**
   * Breakpoint at which the auth status moves to mobile menu (in pixels)
   * @default 520
   */
  mobileMenuBreakpoint?: number;
  /**
   * Custom class name for the root element
   */
  className?: string;
  /**
   * Auth-related props
   */
  auth?: {
    isAuthenticated: boolean;
    user?: {
      email?: string;
      userName?: string;
      name?: string;
      [key: string]: any;
    };
    loading?: boolean;
    onSignIn?: (returnUrl?: string) => void;
    onSignOut?: () => void;
    labels?: {
      notSignedIn?: string;
      signIn?: string;
      signOut?: string;
      welcome?: (userName?: string, email?: string) => string;
    };
  };
  /**
   * Custom render function for navigation links
   * Useful for integrating with different routing solutions
   */
  renderLink?: (link: NavLinkItem, isMobile?: boolean) => ReactNode;
  /**
   * Custom render function for the brand/logo
   */
  renderBrand?: (brand: { logo?: string; text: string; href?: string }) => ReactNode;
}
