import React, { forwardRef } from 'react';
import type { AppLauncherItemProps } from './types';

/**
 * Individual item in the App Launcher grid.
 * Displays an icon with a label below it.
 */
export const AppLauncherItem = forwardRef<HTMLButtonElement, AppLauncherItemProps>(
  ({ item, onClick, onKeyDown, isFocused }, ref) => {
    const { icon, label, href, description, badge } = item;

    const handleClick = () => {
      if (href) {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
      onClick?.();
    };

    const content = (
      <>
        <span className="app-launcher-item__icon" aria-hidden="true">
          {icon}
        </span>
        <span className="app-launcher-item__label">{label}</span>
        {description && (
          <span className="app-launcher-item__description">{description}</span>
        )}
        {badge && (
          <span className="app-launcher-item__badge">{badge}</span>
        )}
      </>
    );

    const commonProps = {
      className: `app-launcher-item ${isFocused ? 'app-launcher-item--focused' : ''}`,
      role: 'menuitem',
      tabIndex: isFocused ? 0 : -1,
      onKeyDown,
      'aria-label': description ? `${label}: ${description}` : label,
    };

    // If href is provided and no custom onClick, use an anchor element
    if (href && !item.onClick) {
      return (
        <a
          {...commonProps}
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            e.preventDefault();
            handleClick();
          }}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        {...commonProps}
        ref={ref}
        type="button"
        onClick={handleClick}
      >
        {content}
      </button>
    );
  }
);

AppLauncherItem.displayName = 'AppLauncherItem';

export default AppLauncherItem;
