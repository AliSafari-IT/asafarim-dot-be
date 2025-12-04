import type { ReactNode } from 'react';

export interface AppLauncherItem {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  description?: string;
  badge?: string;
}

export interface AppLauncherSection {
  id: string;
  title?: string;
  items: AppLauncherItem[];
}

export interface AppLauncherProps {
  /** Items to display in the launcher grid */
  items: AppLauncherItem[];
  /** Optional sections for grouped layout */
  sections?: AppLauncherSection[];
  /** Number of columns (default: 3) */
  columns?: 3 | 4 | 5;
  /** Show search input */
  showSearch?: boolean;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Callback when search value changes */
  onSearch?: (query: string) => void;
  /** Custom trigger element */
  trigger?: ReactNode;
  /** Additional class name for the trigger */
  triggerClassName?: string;
  /** Additional class name for the panel */
  panelClassName?: string;
  /** Controlled open state */
  isOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
  /** Aria label for the trigger */
  triggerLabel?: string;
  /** Panel title for accessibility */
  panelTitle?: string;
}

export interface AppLauncherPanelProps {
  items: AppLauncherItem[];
  sections?: AppLauncherSection[];
  columns?: 3 | 4 | 5;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onClose: () => void;
  onItemClick?: (item: AppLauncherItem) => void;
  className?: string;
  style?: React.CSSProperties;
  panelTitle?: string;
}

export interface AppLauncherItemProps {
  item: AppLauncherItem;
  onClick?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  isFocused?: boolean;
}

export interface LauncherPosition {
  horizontal: 'left' | 'right' | 'center';
  vertical: 'above' | 'below';
  transformOrigin: string;
  style: React.CSSProperties;
}
