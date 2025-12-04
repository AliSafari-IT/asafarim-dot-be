import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Avatar } from './AvatarComponent';
import { AvatarMenu } from './AvatarMenu';
import { useAvatarMenuPosition } from './useAvatarMenuPosition';
import type { AvatarProps, AvatarMenuSection, User } from './types';
import './Avatar.css';

export interface AvatarWithMenuProps extends Omit<AvatarProps, 'onClick'> {
  /** User data - required for menu */
  user: User;
  /** Logout handler */
  onLogout?: () => void;
  /** Manage account handler */
  onManageAccount?: () => void;
  /** Switch account handler */
  onSwitchAccount?: () => void;
  /** Additional accounts for switching */
  additionalAccounts?: User[];
  /** Custom menu sections */
  menuSections?: AvatarMenuSection[];
  /** Controlled open state */
  isOpen?: boolean;
  /** Open state change handler */
  onOpenChange?: (open: boolean) => void;
  /** Menu panel class name */
  menuClassName?: string;
}

/**
 * Avatar with integrated dropdown menu.
 * Combines Avatar trigger with AvatarMenu in a portal.
 * 
 * @example
 * ```tsx
 * <AvatarWithMenu
 *   user={currentUser}
 *   size="md"
 *   bordered
 *   onLogout={handleLogout}
 *   onManageAccount={() => navigate('/settings')}
 *   menuSections={[
 *     {
 *       id: 'settings',
 *       title: 'Settings',
 *       items: [
 *         { id: 'profile', label: 'Profile', onClick: () => navigate('/profile') },
 *         { id: 'security', label: 'Security', href: '/security' },
 *       ],
 *     },
 *   ]}
 * />
 * ```
 */
export function AvatarWithMenu({
  user,
  size = 'md',
  bordered = false,
  showStatusDot = false,
  statusColor,
  className = '',
  fallback,
  alt,
  onLogout,
  onManageAccount,
  onSwitchAccount,
  additionalAccounts,
  menuSections,
  isOpen: controlledIsOpen,
  onOpenChange,
  menuClassName = '',
}: AvatarWithMenuProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Use controlled or internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = useCallback(
    (open: boolean) => {
      setInternalIsOpen(open);
      onOpenChange?.(open);
    },
    [onOpenChange]
  );

  // Get position for the menu
  const position = useAvatarMenuPosition(triggerRef, isOpen, {
    menuWidth: 320,
    menuMaxHeight: 480,
  });

  // Toggle handler
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // Close handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
    triggerRef.current?.focus();
  }, [setIsOpen]);

  // Handle escape key on trigger
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault();
        handleClose();
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleToggle();
      }
    },
    [isOpen, handleClose, handleToggle]
  );

  // Close on escape anywhere
  useEffect(() => {
    const handleGlobalEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleGlobalEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleGlobalEscape);
    };
  }, [isOpen, handleClose]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`avatar-trigger ${isOpen ? 'avatar-trigger--active' : ''}`}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={`${user.displayName || user.username} account menu`}
        style={{ cursor: 'pointer' }}
      >
        {/* Avatar without onClick to avoid nested buttons */}
        <Avatar
          user={user}
          size={size}
          bordered={bordered}
          showStatusDot={showStatusDot}
          statusColor={statusColor}
          fallback={fallback}
          alt={alt}
          className={className}
          onClick={undefined}
        />
      </button>

      {isOpen &&
        createPortal(
            <div
              className={`avatar-menu-overlay ${isOpen ? 'avatar-menu-overlay--visible' : ''} ${
                position.isMobile ? 'avatar-menu-overlay--mobile' : ''
              }`}
              aria-hidden="true"
            >
            <AvatarMenu
              user={user}
              onLogout={onLogout}
              onManageAccount={onManageAccount}
              onSwitchAccount={onSwitchAccount}
              additionalAccounts={additionalAccounts}
              customSections={menuSections}
              onClose={handleClose}
              className={menuClassName}
              style={{
                ...position.style,
                transformOrigin: position.transformOrigin,
                // Force visibility - override CSS animation
                opacity: 1,
                transform: 'scale(1)',
                zIndex: 9999,
                // Fallback positioning if not yet calculated
                ...(Object.keys(position.style).length === 0 && {
                  position: 'fixed' as const,
                  right: '16px',
                  top: '60px',
                  width: '320px',
                  maxHeight: '480px',
                }),
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default AvatarWithMenu;
