import {
  getThemeColors,
  type AppThemeColors,
  type ResolvedTheme,
  type ThemePreference,
} from '@/constants/app-theme';
import { loadThemePreference, saveThemePreference } from '@/lib/app-settings';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

type AppThemeContextValue = {
  preference: ThemePreference;
  resolved: ResolvedTheme;
  colors: AppThemeColors;
  isReady: boolean;
  setPreference: (next: ThemePreference) => void;
};

const AppThemeContext = createContext<AppThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    void loadThemePreference().then(stored => {
      setPreferenceState(stored);
      setIsReady(true);
    });
  }, []);

  const resolved: ResolvedTheme = useMemo(() => {
    if (preference === 'system') {
      return systemScheme === 'dark' ? 'dark' : 'light';
    }
    return preference;
  }, [preference, systemScheme]);

  const colors = useMemo(() => getThemeColors(resolved), [resolved]);

  const setPreference = useCallback((next: ThemePreference) => {
    setPreferenceState(next);
    void saveThemePreference(next);
  }, []);

  const value = useMemo(
    () => ({
      preference,
      resolved,
      colors,
      isReady,
      setPreference,
    }),
    [preference, resolved, colors, isReady, setPreference]
  );

  return (
    <AppThemeContext.Provider value={value}>{children}</AppThemeContext.Provider>
  );
}

export function useAppTheme(): AppThemeContextValue {
  const context = useContext(AppThemeContext);
  if (!context) {
    throw new Error('useAppTheme must be used within AppThemeProvider');
  }
  return context;
}
