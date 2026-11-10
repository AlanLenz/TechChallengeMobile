import { useColorScheme as useNativeWindColorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { preferencesStorage } from '@/services/storage.service';

type ThemePreference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  colorScheme: 'light' | 'dark';
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
};

const THEME_STORAGE_KEY = 'preferences/theme';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { colorScheme, setColorScheme } = useNativeWindColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('light');

  useEffect(() => {
    // A paleta do projeto (bg-background #E4EDE3 e superfícies claras) é voltada ao tema claro;
    // inicializar em 'light' evita que o modo escuro do iOS aplique classes `dark:text-white`
    // sobre o fundo claro `#E4EDE3`, gerando textos brancos/cinzas ilegíveis.
    setColorScheme('light');
    preferencesStorage.getItem(THEME_STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark') {
        setPreferenceState(stored);
        setColorScheme(stored);
      }
    });
  }, [setColorScheme]);

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next);
    setColorScheme(next);
    preferencesStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <ThemeContext.Provider value={{ colorScheme: colorScheme ?? 'light', preference, setPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeContext deve ser usado dentro de <ThemeProvider>.');
  return context;
}
