import React, { useCallback, useEffect, useRef, useState } from 'react';
import type { AvatarMenuProps, AvatarMenuItem } from './types';
import { Avatar } from './AvatarComponent';
import './Avatar.css';

/**
 * Format date for display
 */
function formatDateTime(dateString?: string): string {
  if (!dateString) return 'Never';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Unknown';
  }
}

/**
 * AvatarMenu Component
 * 
 * Google-inspired user account menu with profile info, actions, and settings.
 * 
 * @example
 * ```tsx
 * <AvatarMenu
 *   user={currentUser}
 *   onLogout={handleLogout}
 *   onManageAccount={() => navigate('/account')}
 * />
 * ```
 */
export function AvatarMenu({
  user,
  onLogout,
  onManageAccount,
  onSwitchAccount,
  additionalAccounts = [],
  customSections = [],
  onClose,
  className = '',
  style,
}: AvatarMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const itemRefs = useRef<(HTMLButtonElement | HTMLAnchorElement | null)[]>([]);

  const isAdmin = user.isAdmin?.() ?? user.roles?.includes('admin') ?? user.roles?.includes('ROLE_ADMIN');

  // Collect all focusable items
  const allItems: AvatarMenuItem[] = [
    ...(onManageAccount ? [{ id: 'manage', label: 'Manage Account', onClick: onManageAccount }] : []),
    ...(onSwitchAccount ? [{ id: 'switch', label: 'Switch Account', onClick: onSwitchAccount }] : []),
    ...customSections.flatMap((section) => section.items),
    ...(onLogout ? [{ id: 'logout', label: 'Sign out', onClick: onLogout, danger: true }] : []),
  ];

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          onClose?.();
          break;
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % allItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex((prev) => (prev - 1 + allItems.length) % allItems.length);
          break;
        case 'Home':
          e.preventDefault();
          setFocusedIndex(0);
          break;
        case 'End':
          e.preventDefault();
          setFocusedIndex(allItems.length - 1);
          break;
        case 'Tab':
          // Allow tab to close menu
          onClose?.();
          break;
      }
    },
    [allItems.length, onClose]
  );

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && itemRefs.current[focusedIndex]) {
      itemRefs.current[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  let itemIndex = 0;

  const renderMenuItem = (item: AvatarMenuItem, isDanger = false) => {
    const currentIndex = itemIndex++;
    const classes = [
      'avatar-menu__item',
      isDanger && 'avatar-menu__item--danger',
      item.disabled && 'avatar-menu__item--disabled',
    ]
      .filter(Boolean)
      .join(' ');

    const props = {
      ref: (el: HTMLButtonElement | HTMLAnchorElement | null) => {
        itemRefs.current[currentIndex] = el;
      },
      className: classes,
      role: 'menuitem' as const,
      tabIndex: focusedIndex === currentIndex ? 0 : -1,
      'aria-disabled': item.disabled,
    };

    if (item.href && !item.disabled) {
      return (
        <a key={item.id} href={item.href} {...props}>
          {item.icon && <span className="avatar-menu__item-icon">{item.icon}</span>}
          <span className="avatar-menu__item-label">{item.label}</span>
        </a>
      );
    }

    return (
      <button
        key={item.id}
        type="button"
        {...props}
        onClick={() => {
          if (!item.disabled) {
            item.onClick?.();
            onClose?.();
          }
        }}
        disabled={item.disabled}
      >
        {item.icon && <span className="avatar-menu__item-icon">{item.icon}</span>}
        <span className="avatar-menu__item-label">{item.label}</span>
      </button>
    );
  };

  return (
    <div
      ref={menuRef}
      className={`avatar-menu ${className}`}
      style={style}
      role="menu"
      aria-label="User menu"
      onKeyDown={handleKeyDown}
    >
      {/* Header Section */}
      <div className="avatar-menu__header">
        <Avatar user={user} size="xl" bordered />
        <div className="avatar-menu__user-info">
          <span className="avatar-menu__display-name">
            {user.displayName || user.username}
            {isAdmin && <span className="avatar-menu__admin-tag">Admin</span>}
          </span>
          <span className="avatar-menu__email">{user.email}</span>
        </div>
        {onManageAccount && (
          <button
            type="button"
            className="avatar-menu__manage-btn"
            onClick={() => {
              onManageAccount();
              onClose?.();
            }}
            ref={(el) => {
              itemRefs.current[itemIndex++] = el;
            }}
            role="menuitem"
          >
            Manage your Account
          </button>
        )}
      </div>

      {/* Locked Warning */}
      {user.locked && (
        <div className="avatar-menu__warning">
          <span className="avatar-menu__warning-icon">⚠️</span>
          <div className="avatar-menu__warning-content">
            <span className="avatar-menu__warning-title">Account Locked</span>
            {user.lockReason && (
              <span className="avatar-menu__warning-reason">{user.lockReason}</span>
            )}
          </div>
        </div>
      )}

      {/* Account Switching */}
      {(onSwitchAccount || additionalAccounts.length > 0) && (
        <div className="avatar-menu__section">
          <span className="avatar-menu__section-title">Switch account</span>
          {additionalAccounts.map((account) => (
            <button
              key={account.id}
              type="button"
              className="avatar-menu__account-item"
              onClick={() => {
                onSwitchAccount?.();
                onClose?.();
              }}
              ref={(el) => {
                itemRefs.current[itemIndex++] = el;
              }}
              role="menuitem"
            >
              <Avatar user={account} size="sm" />
              <div className="avatar-menu__account-info">
                <span className="avatar-menu__account-name">
                  {account.displayName || account.username}
                </span>
                <span className="avatar-menu__account-email">{account.email}</span>
              </div>
            </button>
          ))}
          {onSwitchAccount && additionalAccounts.length === 0 && (
            <button
              type="button"
              className="avatar-menu__item"
              onClick={() => {
                onSwitchAccount();
                onClose?.();
              }}
              ref={(el) => {
                itemRefs.current[itemIndex++] = el;
              }}
              role="menuitem"
            >
              <span className="avatar-menu__item-icon">➕</span>
              <span className="avatar-menu__item-label">Add another account</span>
            </button>
          )}
        </div>
      )}

      {/* Activity Section */}
      {(user.lastLogin || user.failedLoginAttempts) && (
        <div className="avatar-menu__activity">
          {user.lastLogin && (
            <div className="avatar-menu__activity-row">
              <span className="avatar-menu__activity-label">Last login:</span>
              <span className="avatar-menu__activity-value">
                {formatDateTime(user.lastLogin)}
                {user.lastLoginIp && (
                  <span className="avatar-menu__activity-ip"> from {user.lastLoginIp}</span>
                )}
              </span>
            </div>
          )}
          {user.failedLoginAttempts !== undefined && user.failedLoginAttempts > 0 && (
            <div className="avatar-menu__activity-row avatar-menu__activity-row--warning">
              <span className="avatar-menu__activity-label">Failed attempts:</span>
              <span className="avatar-menu__activity-value">{user.failedLoginAttempts}</span>
            </div>
          )}
        </div>
      )}

      {/* Custom Sections */}
      {customSections.map((section) => (
        <div key={section.id} className="avatar-menu__section">
          {section.title && (
            <span className="avatar-menu__section-title">{section.title}</span>
          )}
          {section.items.map((item) => renderMenuItem(item, item.danger))}
        </div>
      ))}

      {/* Footer with Logout */}
      {onLogout && (
        <div className="avatar-menu__footer">
          <button
            type="button"
            className="avatar-menu__logout-btn"
            onClick={() => {
              onLogout();
              onClose?.();
            }}
            ref={(el) => {
              itemRefs.current[itemIndex++] = el;
            }}
            role="menuitem"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}

export default AvatarMenu;
