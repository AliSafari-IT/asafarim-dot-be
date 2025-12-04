/**
 * ThemeToggle component for switching themes
 */

import type { CSSProperties, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';

type ThemeToggleVariant = 'default' | 'outline' | 'ghost' | 'link' | 'circle' | 'icon';

interface ThemeToggleProps {
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Custom light icon (default: ☀️)
   */
  lightIcon?: ReactNode;
  
  /**
   * Custom dark icon (default: 🌙)
   */
  darkIcon?: ReactNode;
  
  /**
   * Button aria-label
   */
  ariaLabel?: string;

  /**
   * Button variant
   */
  variant?: ThemeToggleVariant;
}

/**
 * ThemeToggle component
 * 
 * A button that toggles between light and dark themes
 * 
 * @example
 * ```tsx
 * import { ThemeToggle } from '@asafarim/react-themes';
 * 
 * function Header() {
 *   return (
 *     <header>
 *       <ThemeToggle />
 *     </header>
 *   );
 * }
 * ```
 */
export function ThemeToggle({
  className = '',
  lightIcon = '☀️',
  darkIcon = '🌙',
  ariaLabel = 'Toggle theme',
  variant = 'default'
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();

  const baseStyles: CSSProperties = {
    borderRadius: 'var(--theme-radius-md, 0.375rem)',
    padding: '0.5rem',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.25rem',
    transition: 'all 0.2s ease-in-out',
    color: 'var(--color-text, #0f172a)',
  };

  const variantStyles: Record<ThemeToggleVariant, CSSProperties> = {
    default: {
      background: 'var(--color-surface, white)',
      border: '1px solid var(--color-border, #e5e7eb)',
      color: 'var(--color-text, #0f172a)',
      textAlign: 'center',
    },
    outline: {
      background: 'transparent',
      border: '1px solid var(--color-border, #e5e7eb)',
      color: 'var(--color-text, #0f172a)',
      textAlign: 'center',
      outline: 'none',
      
    },
    ghost: {
      background: 'transparent',
      border: 'none',
      color: 'var(--color-text, #0f172a)',
      textAlign: 'center',
    },
    link: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      fontSize: '1rem',
      color: 'var(--color-primary, #2563eb)',
      textAlign: 'center',

    },
    circle: {
      background: 'var(--color-surface, white)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: '9999px',
      width: '2.5rem',
      height: '2.5rem',
      textAlign: 'center',
    },
    icon: {
      background: 'transparent',
      border: 'none',
      padding: 0,
      fontSize: '1.5rem',
      textAlign: 'center',
    },
  };

  const mergedStyles = {
    ...baseStyles,
    ...(variantStyles[variant] ?? variantStyles.default),
  };
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={mergedStyles}
    >
      {resolvedTheme === 'light' ? darkIcon : lightIcon}
    </button>
  );
}
