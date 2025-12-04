/**
 * Avatar Component Example Usage
 * 
 * This file demonstrates how to use the Avatar and AvatarMenu components
 * in your application's navbar.
 */

import React from 'react';
import { Avatar } from './AvatarComponent';
import { AvatarMenu } from './AvatarMenu';
import { AvatarWithMenu } from './AvatarWithMenu';
import type { User, AvatarMenuSection } from './types';

// =============================================================================
// Example User Data (matching backend model)
// =============================================================================

export const mockUser: User = {
  id: 'usr_123456',
  username: 'johndoe',
  email: 'john.doe@asafarim.be',
  displayName: 'John Doe',
  avatarUrl: null, // Will show initials "JD"
  roles: ['user', 'admin'],
  isAdmin: () => true,
  locked: false,
  lockReason: undefined,
  lockedAt: undefined,
  lastLogin: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
  lastLoginIp: '192.168.1.100',
  failedLoginAttempts: 0,
};

export const mockLockedUser: User = {
  id: 'usr_789',
  username: 'lockeduser',
  email: 'locked@example.com',
  displayName: 'Locked User',
  avatarUrl: null,
  roles: ['user'],
  locked: true,
  lockReason: 'Too many failed login attempts',
  lockedAt: new Date().toISOString(),
  lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
  lastLoginIp: '10.0.0.1',
  failedLoginAttempts: 5,
};

export const mockUserWithAvatar: User = {
  id: 'usr_456',
  username: 'janedoe',
  email: 'jane@asafarim.be',
  displayName: 'Jane Doe',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
  roles: ['user'],
  lastLogin: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
  lastLoginIp: '172.16.0.50',
  failedLoginAttempts: 0,
};

// Additional accounts for switching
export const additionalAccounts: User[] = [
  {
    id: 'usr_work',
    username: 'john.work',
    email: 'john@company.com',
    displayName: 'John (Work)',
    avatarUrl: null,
    roles: ['user'],
  },
  {
    id: 'usr_personal',
    username: 'john.personal',
    email: 'john.personal@gmail.com',
    displayName: 'John (Personal)',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=personal',
    roles: ['user'],
  },
];

// =============================================================================
// Custom Menu Sections
// =============================================================================

export const settingsMenuSections: AvatarMenuSection[] = [
  {
    id: 'settings',
    title: 'Settings',
    items: [
      {
        id: 'profile',
        label: 'Profile Settings',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        ),
        onClick: () => console.log('Navigate to profile'),
      },
      {
        id: 'security',
        label: 'Security',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        ),
        href: '/security',
      },
      {
        id: 'language',
        label: 'Language & Region',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
        onClick: () => console.log('Open language settings'),
      },
    ],
  },
  {
    id: 'support',
    title: 'Support',
    items: [
      {
        id: 'help',
        label: 'Help Center',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
        href: '/help',
      },
      {
        id: 'feedback',
        label: 'Send Feedback',
        icon: (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        ),
        onClick: () => console.log('Open feedback form'),
      },
    ],
  },
];

// =============================================================================
// Demo: Basic Avatar Sizes
// =============================================================================

export function AvatarSizesDemo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-md)', alignItems: 'center' }}>
      <Avatar user={mockUser} size="xs" />
      <Avatar user={mockUser} size="sm" />
      <Avatar user={mockUser} size="md" />
      <Avatar user={mockUser} size="lg" />
      <Avatar user={mockUser} size="xl" />
    </div>
  );
}

// =============================================================================
// Demo: Avatar States
// =============================================================================

export function AvatarStatesDemo() {
  return (
    <div style={{ display: 'flex', gap: 'var(--spacing-lg)', alignItems: 'center' }}>
      {/* With initials */}
      <Avatar user={mockUser} size="lg" />
      
      {/* With image */}
      <Avatar user={mockUserWithAvatar} size="lg" />
      
      {/* Bordered */}
      <Avatar user={mockUser} size="lg" bordered />
      
      {/* With status dot */}
      <Avatar user={mockUser} size="lg" showStatusDot statusColor="var(--color-success)" />
      
      {/* Admin user */}
      <Avatar user={mockUser} size="lg" />
      
      {/* Locked user */}
      <Avatar user={mockLockedUser} size="lg" />
      
      {/* With children fallback */}
      <Avatar size="lg">👤</Avatar>
    </div>
  );
}

// =============================================================================
// Demo: Avatar Menu Standalone
// =============================================================================

export function AvatarMenuDemo() {
  return (
    <div style={{ width: 320, margin: '0 auto' }}>
      <AvatarMenu
        user={mockUser}
        onLogout={() => console.log('Logout')}
        onManageAccount={() => console.log('Manage account')}
        onSwitchAccount={() => console.log('Switch account')}
        additionalAccounts={additionalAccounts}
        customSections={settingsMenuSections}
        onClose={() => console.log('Menu closed')}
      />
    </div>
  );
}

// =============================================================================
// Demo: Avatar Menu with Locked User Warning
// =============================================================================

export function LockedUserMenuDemo() {
  return (
    <div style={{ width: 320, margin: '0 auto' }}>
      <AvatarMenu
        user={mockLockedUser}
        onLogout={() => console.log('Logout')}
        onManageAccount={() => console.log('Manage account')}
        onClose={() => console.log('Menu closed')}
      />
    </div>
  );
}

// =============================================================================
// Demo: Navbar Integration with AvatarWithMenu
// =============================================================================

export function NavbarWithAvatarDemo() {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 'var(--nav-height, 60px)',
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
        {/* Notifications placeholder */}
        <button
          type="button"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 'var(--spacing-sm)',
            borderRadius: 'var(--radius-full)',
            cursor: 'pointer',
            color: 'var(--color-text)',
          }}
        >
          🔔
        </button>

        {/* Avatar with menu */}
        <AvatarWithMenu
          user={mockUser}
          size="md"
          bordered
          showStatusDot
          statusColor="var(--color-success)"
          onLogout={() => console.log('Logout clicked')}
          onManageAccount={() => console.log('Navigate to /account')}
          onSwitchAccount={() => console.log('Switch account')}
          additionalAccounts={additionalAccounts}
          menuSections={settingsMenuSections}
        />
      </div>
    </nav>
  );
}

// =============================================================================
// Demo: Controlled State
// =============================================================================

export function ControlledAvatarMenu() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>Open Avatar Menu</button>
      <AvatarWithMenu
        user={mockUser}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onLogout={() => {
          console.log('Logout');
          setIsOpen(false);
        }}
      />
    </div>
  );
}

export default NavbarWithAvatarDemo;
