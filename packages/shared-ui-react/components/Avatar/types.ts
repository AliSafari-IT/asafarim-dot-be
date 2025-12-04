import type { ReactNode } from 'react';

/**
 * User model matching backend entity
 */
export interface AvatarUser {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl?: string | null;
  roles?: string[];
  isAdmin?: () => boolean;
  locked?: boolean;
  lockReason?: string;
  lockedAt?: string;
  lastLogin?: string;
  lastLoginIp?: string;
  failedLoginAttempts?: number;
}

/**
 * Backward compatibility alias
 */
export type User = AvatarUser;

/**
 * Avatar sizes
 */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/**
 * Avatar component props
 */
export interface AvatarProps {
  /** User data for avatar display */
  user?: User | null;
  /** Avatar size */
  size?: AvatarSize;
  /** Show bordered style with ring */
  bordered?: boolean;
  /** Show online/offline status dot */
  showStatusDot?: boolean;
  /** Status dot color (use CSS variable) */
  statusColor?: string;
  /** Click handler */
  onClick?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Fallback content when no avatar (also accepts children) */
  fallback?: ReactNode;
  /** Children as fallback content */
  children?: ReactNode;
  /** Alt text for image */
  alt?: string;
}

/**
 * Menu item for AvatarMenu
 */
export interface AvatarMenuItem {
  id: string;
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  danger?: boolean;
  disabled?: boolean;
}

/**
 * Menu section for AvatarMenu
 */
export interface AvatarMenuSection {
  id: string;
  title?: string;
  items: AvatarMenuItem[];
}

/**
 * AvatarMenu component props
 */
export interface AvatarMenuProps {
  /** User data */
  user: AvatarUser;
  /** Logout handler */
  onLogout?: () => void;
  /** Manage account handler */
  onManageAccount?: () => void;
  /** Switch account handler */
  onSwitchAccount?: () => void;
  /** Additional accounts for switching */
  additionalAccounts?: AvatarUser[];
  /** Custom menu sections */
  customSections?: AvatarMenuSection[];
  /** Close handler */
  onClose?: () => void;
  /** Additional CSS class */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

/**
 * Avatar menu position
 */
export interface AvatarMenuPosition {
  style: React.CSSProperties;
  transformOrigin: string;
  isMobile: boolean;
}
