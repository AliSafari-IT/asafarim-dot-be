import { useCallback, useEffect, useState } from 'react';
import type { LauncherPosition } from './types';

interface UseLauncherPositionOptions {
  /** Width of the panel in pixels */
  panelWidth?: number;
  /** Height of the panel in pixels (estimated) */
  panelHeight?: number;
  /** Offset from trigger in pixels */
  offset?: number;
}

const DEFAULT_OPTIONS: Required<UseLauncherPositionOptions> = {
  panelWidth: 360,
  panelHeight: 400,
  offset: 8,
};

/**
 * Hook to calculate the optimal position for the launcher panel
 * based on the trigger element's position and viewport constraints.
 */
export function useLauncherPosition(
  triggerRef: React.RefObject<HTMLElement | null>,
  isOpen: boolean,
  options?: UseLauncherPositionOptions
): LauncherPosition {
  const { panelWidth, panelHeight, offset } = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  const [position, setPosition] = useState<LauncherPosition>({
    horizontal: 'right',
    vertical: 'below',
    transformOrigin: 'top right',
    style: {},
  });

  const calculatePosition = useCallback(() => {
    if (!triggerRef.current || !isOpen) return;

    const trigger = triggerRef.current;
    const rect = trigger.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Calculate available space in each direction
    const spaceRight = viewportWidth - rect.right;
    const spaceLeft = rect.left;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    // Determine horizontal position
    let horizontal: 'left' | 'right' | 'center' = 'right';
    let left: number | undefined;
    let right: number | undefined;

    // Check if we're on mobile (use full width)
    const isMobile = viewportWidth <= 640;

    if (isMobile) {
      // Mobile: center horizontally with padding
      horizontal = 'center';
      left = 16;
      right = 16;
    } else if (spaceRight >= panelWidth + offset) {
      // Enough space on the right - align panel's right edge with trigger's right edge
      horizontal = 'right';
      right = viewportWidth - rect.right;
    } else if (spaceLeft >= panelWidth + offset) {
      // Enough space on the left - align panel's left edge with trigger's left edge
      horizontal = 'left';
      left = rect.left;
    } else {
      // Center the panel
      horizontal = 'center';
      const centerX = rect.left + rect.width / 2;
      left = Math.max(offset, centerX - panelWidth / 2);
      // Make sure it doesn't overflow right
      if (left + panelWidth > viewportWidth - offset) {
        left = viewportWidth - panelWidth - offset;
      }
    }

    // Determine vertical position
    let vertical: 'above' | 'below' = 'below';
    let top: number | undefined;
    let bottom: number | undefined;

    if (spaceBelow >= panelHeight + offset || spaceBelow >= spaceAbove) {
      // Prefer below if there's enough space or more than above
      vertical = 'below';
      top = rect.bottom + offset;
    } else {
      // Position above
      vertical = 'above';
      bottom = viewportHeight - rect.top + offset;
    }

    // Calculate transform origin for smooth animation
    const transformOriginY = vertical === 'below' ? 'top' : 'bottom';
    const transformOriginX = horizontal === 'left' ? 'left' : horizontal === 'right' ? 'right' : 'center';
    const transformOrigin = `${transformOriginY} ${transformOriginX}`;

    // Build the style object
    const style: React.CSSProperties = {
      position: 'fixed',
    };

    if (isMobile) {
      // Mobile: full width bottom sheet
      style.left = left;
      style.right = right;
      style.bottom = 0;
      style.top = 'auto';
      style.maxHeight = `calc(80vh - ${offset}px)`;
      style.borderRadius = 'var(--radius-xl) var(--radius-xl) 0 0';
    } else {
      if (left !== undefined) style.left = left;
      if (right !== undefined) style.right = right;
      if (top !== undefined) style.top = top;
      if (bottom !== undefined) style.bottom = bottom;
      style.maxHeight = `calc(100vh - ${offset * 2}px - ${top || 0}px)`;
    }

    setPosition({
      horizontal,
      vertical,
      transformOrigin,
      style,
    });
  }, [triggerRef, isOpen, panelWidth, panelHeight, offset]);

  useEffect(() => {
    calculatePosition();

    if (isOpen) {
      window.addEventListener('resize', calculatePosition);
      window.addEventListener('scroll', calculatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', calculatePosition);
      window.removeEventListener('scroll', calculatePosition, true);
    };
  }, [calculatePosition, isOpen]);

  return position;
}

export default useLauncherPosition;
