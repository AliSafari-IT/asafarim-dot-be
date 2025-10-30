import { CentralNavbar, useAuth, isProduction } from "@asafarim/shared-ui-react";
import type { NavLinkItem } from "@asafarim/shared-ui-react";

export default function Navbar() {
  const { isAuthenticated, user, loading } = useAuth({
    authApiBase: isProduction
      ? "https://identity.asafarim.be/auth"
      : "http://identity.asafarim.local:5101/auth",
    meEndpoint: "/me",
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
          window.location.href = isProduction
            ? "https://identity.asafarim.be/login"
            : "http://identity.asafarim.local:5177/login";
        },
        onSignOut: () => {
          window.location.href = isProduction
            ? "https://identity.asafarim.be/logout"
            : "http://identity.asafarim.local:5177/logout";
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
