/**
 * ThemeToggle component for switching themes
 */

import { useTheme } from '../hooks/useTheme';

interface ThemeToggleProps {
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Custom light icon (default: ☀️)
   */
  lightIcon?: React.ReactNode;
  
  /**
   * Custom dark icon (default: 🌙)
   */
  darkIcon?: React.ReactNode;
  
  /**
   * Button aria-label
   */
  ariaLabel?: string;
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
}: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={ariaLabel}
      title={ariaLabel}
      style={{
        background: 'var(--theme-color-surface, transparent)',
        border: '1px solid var(--theme-color-border, #e5e7eb)',
        borderRadius: 'var(--theme-radius-md, 0.375rem)',
        padding: '0.5rem',
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {resolvedTheme === 'light' ? darkIcon : lightIcon}
    </button>
  );
}
