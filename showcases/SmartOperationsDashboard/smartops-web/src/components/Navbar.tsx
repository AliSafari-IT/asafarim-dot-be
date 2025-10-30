import { CentralNavbar, useAuth, isProduction } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";

export default function Navbar() {
  const { isAuthenticated, user, loading, signOut } = useAuth({
    authApiBase: isProduction
      ? "https://identity.asafarim.be/auth"
      : "http://identity.asafarim.local:5101/auth",
    meEndpoint: "/me",
    tokenEndpoint: "/token",
    logoutEndpoint: "/logout",
  });

  const navLinks: NavLinkItem[] = [
    { to: "/", label: "Dashboard" },
    { to: "/devices", label: "Devices" },
    ...(user?.roles?.includes("admin") ? [{ to: "/admin/users", label: "Admin" }] : []),
  ];

  const renderLink = (link: NavLinkItem) => {
    if (link.external) {
      return (
        <a
          key={link.to}
          href={link.to}
          target="_blank"
          rel="noopener noreferrer"
        >
          {link.label}
        </a>
      );
    }
    return (
      <a key={link.to} href={link.to}>
        {link.label}
      </a>
    );
  };

  return (
  <CentralNavbar
      appId="smartops"
      localLinks={navLinks}
      brand={{ logo: "/logo.svg", text: "SmartOps", href: "/" }}
      auth={{
        isAuthenticated,
        user: user ? { email: user.email, name: user.name } : undefined,
        loading,
        onSignIn: () => {
          const currentUrl = window.location.href;
          const loginUrl = isProduction
            ? "https://identity.asafarim.be/login"
            : "http://identity.asafarim.local:5177/login";
          window.location.href = `${loginUrl}?returnUrl=${encodeURIComponent(currentUrl)}`;
        },
        onSignOut: () => {
          // Get current path to check if it's a protected route
          const currentPath = window.location.pathname;
          const isProtectedRoute = !['/login', '/register', '/public'].some(route => 
            currentPath.startsWith(route)
          );
          
          // If current route is protected, redirect to home, otherwise stay
          const redirectUrl = isProtectedRoute ? '/' : window.location.href;
          
          // Call signOut with the redirect URL
          signOut(redirectUrl).catch(console.error);
        },
        labels: {
          signIn: "Sign In",
          signOut: "Sign Out",
          welcome(email) {
            return `Signed in as ${email}`;
          },
        },
      }}
      renderLink={renderLink}
    />
  );
}
