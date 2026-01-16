import { type ReactNode } from 'react';
import { ThemeProvider as BaseThemeProvider } from '@asafarim/react-themes';
import type { ThemeMode } from '@asafarim/react-themes';
import useThemeSync from '../../hooks/useThemeSync';

export interface ThemeProviderProps {
  children: ReactNode;
  defaultMode?: ThemeMode;
  storageKey?: string;
}

export const ThemeProvider= ({
  children,
  defaultMode = 'auto' as ThemeMode,
  storageKey = 'asafarim-theme',
}: ThemeProviderProps) => {
  // Use the theme sync hook to keep theme in sync across subdomains
  useThemeSync({ storageKey, defaultTheme: defaultMode });

  return (
    <BaseThemeProvider
      defaultMode={defaultMode}
      storageKey={storageKey}
    >
      {children}
    </BaseThemeProvider>
  );
};

export default ThemeProvider;
