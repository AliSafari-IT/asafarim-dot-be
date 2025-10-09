/**
 * ThemeSelect component for choosing theme mode
 */

import { useTheme } from '../hooks/useTheme';
import type { ThemeMode } from '../types';

interface ThemeSelectProps {
  /**
   * Custom class name
   */
  className?: string;
  
  /**
   * Show labels for options
   */
  showLabels?: boolean;
  
  /**
   * Custom labels
   */
  labels?: {
    light?: string;
    dark?: string;
    system?: string;
  };
}

const DEFAULT_LABELS = {
  light: 'Light',
  dark: 'Dark',
  system: 'System',
};

/**
 * ThemeSelect component
 * 
 * A select dropdown for choosing theme mode (light, dark, or system)
 * 
 * @example
 * ```tsx
 * import { ThemeSelect } from '@asafarim/react-themes';
 * 
 * function Settings() {
 *   return (
 *     <div>
 *       <label>Theme:</label>
 *       <ThemeSelect />
 *     </div>
 *   );
 * }
 * ```
 */
export function ThemeSelect({
  className = '',
  showLabels = true,
  labels = DEFAULT_LABELS,
}: ThemeSelectProps) {
  const { mode, setMode } = useTheme();
  
  const mergedLabels = { ...DEFAULT_LABELS, ...labels };
  
  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setMode(event.target.value as ThemeMode);
  };
  
  return (
    <select
      value={mode}
      onChange={handleChange}
      className={`theme-select ${className}`}
      aria-label="Select theme mode"
      style={{
        background: 'var(--theme-color-surface, #ffffff)',
        border: '1px solid var(--theme-color-border, #e5e7eb)',
        borderRadius: 'var(--theme-radius-md, 0.375rem)',
        padding: '0.5rem 2rem 0.5rem 0.75rem',
        fontSize: '0.875rem',
        color: 'var(--theme-color-text, #111827)',
        cursor: 'pointer',
        outline: 'none',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
      }}
    >
      <option value="light">
        {showLabels ? mergedLabels.light : '☀️'}
      </option>
      <option value="dark">
        {showLabels ? mergedLabels.dark : '🌙'}
      </option>
      <option value="system">
        {showLabels ? mergedLabels.system : '💻'}
      </option>
    </select>
  );
}
