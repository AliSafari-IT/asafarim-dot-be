import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AppLauncherPanel } from './AppLauncherPanel';
import { useLauncherPosition } from './useLauncherPosition';
import type { AppLauncherProps } from './types';
import './AppLauncher.css';

/**
 * App Launcher component - A Google-style grid of app shortcuts.
 * 
 * @example
 * ```tsx
 * <AppLauncher
 *   items={[
 *     { id: '1', label: 'Gmail', icon: <MailIcon />, href: 'https://mail.google.com' },
 *     { id: '2', label: 'Drive', icon: <DriveIcon />, href: 'https://drive.google.com' },
 *   ]}
 *   columns={3}
 *   showSearch
 * />
 * ```
 */
export function AppLauncher({
  items,
  sections,
  columns = 3,
  showSearch = false,
  searchPlaceholder,
  onSearch,
  trigger,
  triggerClassName = '',
  panelClassName = '',
  isOpen: controlledIsOpen,
  onOpenChange,
  triggerLabel = 'Open app launcher',
  panelTitle = 'Apps',
}: AppLauncherProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  
  // Use controlled or internal state
  const isOpen = controlledIsOpen ?? internalIsOpen;
  const setIsOpen = useCallback((open: boolean) => {
    setInternalIsOpen(open);
    onOpenChange?.(open);
  }, [onOpenChange]);

  // Get position for the panel
  const position = useLauncherPosition(triggerRef, isOpen, {
    panelWidth: columns === 3 ? 320 : columns === 4 ? 400 : 480,
  });

  // Toggle handler
  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen, setIsOpen]);

  // Close handler
  const handleClose = useCallback(() => {
    setIsOpen(false);
    // Return focus to trigger
    triggerRef.current?.focus();
  }, [setIsOpen]);

  // Handle escape key on trigger
  const handleTriggerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.preventDefault();
      handleClose();
    }
  }, [isOpen, handleClose]);

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

  // Default grid icon trigger
  const defaultTrigger = (
    <svg
      className="app-launcher-trigger__icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* 3x3 grid of circles */}
      <circle cx="5" cy="5" r="2" />
      <circle cx="12" cy="5" r="2" />
      <circle cx="19" cy="5" r="2" />
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="12" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
    </svg>
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`app-launcher-trigger ${isOpen ? 'app-launcher-trigger--active' : ''} ${triggerClassName}`}
        onClick={handleToggle}
        onKeyDown={handleTriggerKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label={triggerLabel}
      >
        {trigger || defaultTrigger}
      </button>

      {isOpen &&
        createPortal(
          <div 
            className={`app-launcher-overlay ${isOpen ? 'app-launcher-overlay--visible' : ''}`}
            aria-hidden="true"
          >
            <AppLauncherPanel
              items={items}
              sections={sections}
              columns={columns}
              showSearch={showSearch}
              searchPlaceholder={searchPlaceholder}
              onSearch={onSearch}
              onClose={handleClose}
              className={panelClassName}
              style={{
                ...position.style,
                transformOrigin: position.transformOrigin,
              }}
              panelTitle={panelTitle}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default AppLauncher;
