import React from "react";
import { ThemeProvider } from "@asafarim/react-themes";
import { AuthSyncProvider } from "@asafarim/shared-ui-react";

/**
 * Root component for AI-UI app
 *
 * This component wraps the entire application with ThemeProvider and AuthSyncProvider
 * to enable theming and cross-app authentication synchronization.
 *
 * Matches the working pattern from the blog app.
 */
interface RootProps {
  children: React.ReactNode;
}

// Function to get cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(?:^|; )" + name + "=([^;]*)")
  );
  return match ? decodeURIComponent(match[1]) : null;
};

// Get initial theme synchronously to avoid timing issues
const getInitialTheme = (): "dark" | "light" => {
  if (typeof window === "undefined") return "light";

  // Get theme from various sources
  const cookieTheme = getCookie("asafarim_theme");
  const localTheme =
    localStorage.getItem("asafarim-theme") || localStorage.getItem("theme");

  // Use cookie theme first, then localStorage, default to light
  const theme =
    cookieTheme === "light" || cookieTheme === "dark"
      ? cookieTheme
      : localTheme === "light" || localTheme === "dark"
      ? localTheme
      : "light";

  // Set theme keys for consistency
  if (theme === "light" || theme === "dark") {
    localStorage.setItem("asafarim-theme", theme);
    localStorage.setItem("theme", theme);
  }

  return theme as "dark" | "light";
};

export default function Root({ children }: RootProps): React.ReactElement {
  // Get initial theme synchronously (not async in useEffect)
  const initialTheme = getInitialTheme();

  return (
    <ThemeProvider
      config={{ defaultMode: initialTheme, storageKey: "asafarim-theme" }}
    >
      <AuthSyncProvider>{children}</AuthSyncProvider>
    </ThemeProvider>
  );
}
