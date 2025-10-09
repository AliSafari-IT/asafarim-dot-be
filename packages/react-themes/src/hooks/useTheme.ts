/**
 * Hook for accessing theme context
 */

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';
import type { ThemeContextValue } from '../types';

/**
 * Access the current theme and theme controls
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
 *   
 *   return (
 *     <div>
 *       <p>Current mode: {mode}</p>
 *       <p>Resolved theme: {resolvedTheme}</p>
 *       <button onClick={toggleTheme}>Toggle Theme</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  
  return context;
}
