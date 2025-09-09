import React, { type ReactNode } from 'react';
import { ThemeProvider as BaseThemeProvider } from '@asafarim/react-themes';
import useThemeSync from '../../hooks/useThemeSync';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: 'light' | 'dark';
  storageKey?: string;
  persistMode?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultMode = 'dark',
  storageKey = 'asafarim-theme',
  persistMode = true,
}) => {
  // Use the theme sync hook to keep theme in sync across subdomains
  useThemeSync({ storageKey, defaultTheme: defaultMode });

  return (
    <BaseThemeProvider
      defaultMode={defaultMode}
      storageKey={storageKey}
      persistMode={persistMode}
    >
      {children}
    </BaseThemeProvider>
  );
};

export default ThemeProvider;
