import { useState, useEffect, useCallback, type RefObject } from 'react';
import type { AvatarMenuPosition } from './types';

interface UseAvatarMenuPositionOptions {
  /** Menu width in pixels */
  menuWidth?: number;
  /** Menu max height in pixels */
  menuMaxHeight?: number;
  /** Offset from trigger */
  offset?: number;
  /** Mobile breakpoint */
  mobileBreakpoint?: number;
}

/**
 * Hook to calculate optimal position for the avatar menu.
 * Automatically adjusts based on viewport boundaries and trigger position.
 */
export function useAvatarMenuPosition(
  triggerRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
  options: UseAvatarMenuPositionOptions = {}
): AvatarMenuPosition {
  const {
    menuWidth = 320,
    menuMaxHeight = 480,
    offset = 8,
    mobileBreakpoint = 640,
  } = options;

  const [position, setPosition] = useState<AvatarMenuPosition>({
    style: {},
    transformOrigin: 'top right',
    isMobile: false,
  });

  const calculatePosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger || !isOpen) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth < mobileBreakpoint;

    // Mobile: Full-width bottom sheet
    if (isMobile) {
      setPosition({
        style: {
          position: 'fixed',
          left: 0,
          right: 0,
          bottom: 0,
          top: 'auto',
          width: '100%',
          maxHeight: '85vh',
          borderRadius: 'var(--radius-xl) var(--radius-xl) 0 0',
        },
        transformOrigin: 'bottom center',
        isMobile: true,
      });
      return;
    }

    // Desktop positioning
    // const spaceRight = viewportWidth - rect.right;
    // const spaceLeft = rect.left;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let left: number | undefined;
    let right: number | undefined;
    let top: number | undefined;
    let bottom: number | undefined;
    let transformOrigin = 'top right';

    // Horizontal positioning - prefer aligning to right edge of trigger (like Google)
    // Check if menu fits when right-aligned to trigger
    const menuLeftIfRightAligned = rect.right - menuWidth;
    const menuRightIfLeftAligned = rect.left + menuWidth;

    if (menuLeftIfRightAligned >= 0) {
      // Menu fits when right-aligned to trigger's right edge
      right = viewportWidth - rect.right;
      transformOrigin = 'top right';
    } else if (menuRightIfLeftAligned <= viewportWidth) {
      // Menu fits when left-aligned to trigger's left edge
      left = rect.left;
      transformOrigin = 'top left';
    } else {
      // Center horizontally with padding
      right = offset;
      transformOrigin = 'top right';
    }

    // Vertical positioning
    if (spaceBelow >= menuMaxHeight + offset) {
      // Open below trigger
      top = rect.bottom + offset;
    } else if (spaceAbove >= menuMaxHeight + offset) {
      // Open above trigger
      bottom = viewportHeight - rect.top + offset;
      transformOrigin = transformOrigin.replace('top', 'bottom');
    } else {
      // Open below with constrained height
      top = rect.bottom + offset;
    }

    const style: React.CSSProperties = {
      position: 'fixed',
      width: `${menuWidth}px`,
      maxHeight: `${Math.min(
        menuMaxHeight,
        top !== undefined ? viewportHeight - top - offset : spaceAbove - offset
      )}px`,
    };

    if (left !== undefined) style.left = `${left}px`;
    if (right !== undefined) style.right = `${right}px`;
    if (top !== undefined) style.top = `${top}px`;
    if (bottom !== undefined) style.bottom = `${bottom}px`;

    setPosition({
      style,
      transformOrigin,
      isMobile: false,
    });
  }, [triggerRef, isOpen, menuWidth, menuMaxHeight, offset, mobileBreakpoint]);

  useEffect(() => {
    if (isOpen) {
      calculatePosition();

      // Recalculate on scroll/resize
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);

      return () => {
        window.removeEventListener('resize', calculatePosition);
        window.removeEventListener('scroll', calculatePosition, true);
      };
    }
  }, [isOpen, calculatePosition]);

  return position;
}

export default useAvatarMenuPosition;
