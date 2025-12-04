/**
 * App Launcher Example Usage
 * 
 * This file demonstrates how to use the AppLauncher component
 * in your application's navbar.
 */

import React from 'react';
import { AppLauncher } from './AppLauncher';
import type { AppLauncherItem, AppLauncherSection } from './types';

// Example icons (using inline SVGs for demonstration)
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const DriveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2L2 19h20L12 2z" />
  </svg>
);

const DocsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const TasksIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 11l3 3L22 4" />
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
  </svg>
);

const PhotosIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21,15 16,10 5,21" />
  </svg>
);

const SettingsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const AnalyticsIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const UsersIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

// =============================================================================
// Example 1: Simple flat list of apps
// =============================================================================

export const simpleAppItems: AppLauncherItem[] = [
  { id: 'mail', label: 'Mail', icon: <MailIcon />, href: 'https://mail.example.com' },
  { id: 'calendar', label: 'Calendar', icon: <CalendarIcon />, href: 'https://calendar.example.com' },
  { id: 'drive', label: 'Drive', icon: <DriveIcon />, href: 'https://drive.example.com' },
  { id: 'docs', label: 'Docs', icon: <DocsIcon />, href: 'https://docs.example.com' },
  { id: 'tasks', label: 'Tasks', icon: <TasksIcon />, href: '/tasks' },
  { id: 'photos', label: 'Photos', icon: <PhotosIcon />, href: '/photos' },
  { id: 'settings', label: 'Settings', icon: <SettingsIcon />, onClick: () => console.log('Open settings') },
  { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, href: '/analytics' },
  { id: 'users', label: 'Users', icon: <UsersIcon />, href: '/users' },
];

// =============================================================================
// Example 2: Grouped sections
// =============================================================================

export const groupedAppSections: AppLauncherSection[] = [
  {
    id: 'productivity',
    title: 'Productivity',
    items: [
      { id: 'mail', label: 'Mail', icon: <MailIcon />, href: 'https://mail.example.com' },
      { id: 'calendar', label: 'Calendar', icon: <CalendarIcon />, href: 'https://calendar.example.com' },
      { id: 'docs', label: 'Docs', icon: <DocsIcon />, href: 'https://docs.example.com' },
    ],
  },
  {
    id: 'storage',
    title: 'Storage & Files',
    items: [
      { id: 'drive', label: 'Drive', icon: <DriveIcon />, href: 'https://drive.example.com' },
      { id: 'photos', label: 'Photos', icon: <PhotosIcon />, href: '/photos' },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    items: [
      { id: 'settings', label: 'Settings', icon: <SettingsIcon />, onClick: () => console.log('Open settings') },
      { id: 'analytics', label: 'Analytics', icon: <AnalyticsIcon />, href: '/analytics' },
      { id: 'users', label: 'Users', icon: <UsersIcon />, href: '/users' },
    ],
  },
];

// =============================================================================
// Example 3: ASafariM Platform Apps
// =============================================================================

export const asafarimApps: AppLauncherItem[] = [
  {
    id: 'identity',
    label: 'Identity',
    icon: <UsersIcon />,
    href: 'http://identity.asafarim.local:5177',
    description: 'User management',
  },
  {
    id: 'core',
    label: 'Core App',
    icon: <SettingsIcon />,
    href: 'http://core.asafarim.local:5175',
    description: 'Main application',
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: <TasksIcon />,
    href: 'http://taskmanagement.asafarim.local:5176',
    description: 'Project management',
  },
  {
    id: 'smartops',
    label: 'SmartOps',
    icon: <AnalyticsIcon />,
    href: 'http://smartops.asafarim.local:5180',
    description: 'IoT Dashboard',
  },
  {
    id: 'testora',
    label: 'Testora',
    icon: <DocsIcon />,
    href: 'http://testora.asafarim.local:5181',
    description: 'Test automation',
  },
  {
    id: 'blog',
    label: 'Blog',
    icon: <DocsIcon />,
    href: 'http://blog.asafarim.local:3000',
    description: 'Documentation',
  },
];

// =============================================================================
// Demo: Navbar Integration
// =============================================================================

/**
 * Example navbar component with the App Launcher integrated.
 * Uses ASafariM design tokens for consistent styling.
 */
export function NavbarWithAppLauncher() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--height-navbar)',
        padding: '0 var(--spacing-lg)',
        background: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Logo / Brand */}
      <div style={{ fontWeight: 'var(--font-weight-semibold)' }}>
        ASafariM
      </div>

      {/* Right side actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
        {/* App Launcher */}
        <AppLauncher
          items={asafarimApps}
          columns={3}
          showSearch
          searchPlaceholder="Search apps..."
          triggerLabel="Open ASafariM apps"
          panelTitle="ASafariM Apps"
        />

        {/* User avatar placeholder */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 'var(--font-weight-medium)',
          }}
        >
          A
        </div>
      </div>
    </nav>
  );
}

// =============================================================================
// Demo: With Sections
// =============================================================================

export function AppLauncherWithSections() {
  return (
    <AppLauncher
      items={[]}
      sections={groupedAppSections}
      columns={3}
      showSearch
    />
  );
}

// =============================================================================
// Demo: Controlled State
// =============================================================================

export function ControlledAppLauncher() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Launcher</button>
      <AppLauncher
        items={simpleAppItems}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
      />
    </div>
  );
}

export default NavbarWithAppLauncher;
