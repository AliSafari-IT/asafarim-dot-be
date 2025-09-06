// Components
export { default as FooterContainer } from "./components/FooterContainer";
export { default as HeaderContainer } from "./components/HeaderContainer";
export { default as LayoutContainer } from "./components/LayoutContainer";
export { Button } from "./components/Button";

// Auth
export { default as AuthStatus } from "./components/Auth/AuthStatus";
export type { AuthStatusProps } from "./components/Auth/AuthStatus";
export { AuthSyncProvider } from "./contexts/AuthProvider";

// Not Found
export { default as NotFound } from "./components/NotFound/NotFound";

// Navigation
export { default as Navbar } from "./components/Navbar/Navbar";
export { default as CentralNavbar } from "./components/Navbar/CentralNavbar";
export type { NavbarProps, NavLinkItem } from "./components/Navbar/types";
export { appRegistry, appLinkGroups, getAppById, getCurrentAppId } from "./components/Navbar/appRegistry";

// Theme
export { default as ThemeProvider } from "./contexts/ThemeProvider";
export type { ThemeProviderProps } from "./contexts/ThemeProvider";

// Notifications
export { default as NotificationProvider } from "./contexts/NotificationProvider";
export { NotificationContext } from "./contexts/NotificationProvider/notificationContext";
export type { NotificationType, Notification } from "./contexts/NotificationProvider/notificationContext";
export { default as useNotifications } from "./hooks/useNotifications";
export { NotificationContainer } from "./components/Notifications/NotificationContainer";
export type { NotificationContainerProps } from "./components/Notifications/NotificationContainer";

// Hooks
export { default as useAuth } from "./hooks/useAuth";
export type { UseAuthOptions, UseAuthResult } from "./hooks/useAuth";

// SVG Icons
export * from "./svg-icons";
