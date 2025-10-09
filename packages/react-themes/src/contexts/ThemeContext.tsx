/**
 * Theme context for managing theme state
 */

import { createContext } from 'react';
import type { ThemeContextValue } from '../types';

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

ThemeContext.displayName = 'ThemeContext';
