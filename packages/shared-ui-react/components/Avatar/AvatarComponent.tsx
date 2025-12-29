import React, { forwardRef, useMemo } from 'react';
import type { AvatarProps, AvatarSize } from './types';
import './Avatar.css';

/**
 * Size map for avatar dimensions
 */
const sizeMap: Record<AvatarSize, number> = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 56,
};

/**
 * Get initials from display name or username
 */
function getInitials(displayName?: string, username?: string): string {
  const name = displayName || username || '';
  if (!name) return '?';
  
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[parts.length - 1]) {
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/**
 * Generate a consistent color from a string (for fallback background)
 */
function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Generate hue from hash (0-360)
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 65%, 50%)`;
}

/**
 * Avatar Component
 * 
 * A circular avatar displaying user image or initials fallback.
 * Supports various sizes, bordered style, and status indicators.
 * 
 * @example
 * ```tsx
 * <Avatar 
 *   user={{ displayName: 'John Doe', email: 'john@example.com' }}
 *   size="md"
 *   bordered
 *   showStatusDot
 *   statusColor="var(--color-success)"
 * />
 * ```
 */
export const Avatar = forwardRef<HTMLButtonElement, AvatarProps>(
  (
    {
      user,
      size = 'md',
      bordered = false,
      showStatusDot = false,
      statusColor = 'var(--color-success)',
      onClick,
      className = '',
      fallback,
      children,
      alt,
    }: AvatarProps,
    ref
  ) => {
    const dimension = sizeMap[size];
    const initials = useMemo(
      () => getInitials(user?.displayName, user?.username),
      [user?.displayName, user?.username]
    );
    
    const fallbackColor = useMemo(
      () => stringToColor(user?.email || user?.username || 'default'),
      [user?.email, user?.username]
    );

    const hasImage = Boolean(user?.avatarUrl);
    const isAdmin = user?.isAdmin?.() ?? user?.roles?.includes('admin') ?? user?.roles?.includes('ROLE_ADMIN');
    const isLocked = user?.locked;

    const avatarClasses = [
      'avatar',
      `avatar--${size}`,
      bordered && 'avatar--bordered',
      isAdmin && 'avatar--admin',
      isLocked && 'avatar--locked',
      onClick && 'avatar--clickable',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Use children or fallback prop
    const fallbackContent = children || fallback;

    const content = (
      <>
        {hasImage ? (
          <img
            src={user!.avatarUrl!}
            alt={alt || user?.displayName || user?.username || 'User avatar'}
            className="avatar__image"
          />
        ) : fallbackContent ? (
          <span className="avatar__fallback">{fallbackContent}</span>
        ) : (
          <span
            className="avatar__initials"
            style={{ backgroundColor: fallbackColor }}
          >
            {initials}
          </span>
        )}
        
        {showStatusDot && (
          <span
            className="avatar__status-dot"
            style={{ backgroundColor: statusColor }}
            aria-hidden="true"
          />
        )}
        
        {isAdmin && (
          <span className="avatar__admin-badge" aria-label="Administrator">
            ✓
          </span>
        )}
      </>
    );

    const style: React.CSSProperties = {
      width: dimension,
      height: dimension,
      minWidth: dimension,
      minHeight: dimension,
    };

    if (onClick) {
      return (
        <button
          ref={ref}
          type="button"
          className={avatarClasses}
          style={style}
          onClick={onClick}
          aria-label={`${user?.displayName || user?.username || 'User'} avatar`}
        >
          {content}
        </button>
      );
    }

    return (
      <div className={avatarClasses} style={style} role="img" aria-label={alt || user?.displayName || 'Avatar'}>
        {content}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
