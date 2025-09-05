import React, { type ReactNode } from 'react';
import { ThemeProvider as BaseThemeProvider } from '@asafarim/react-themes';

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
