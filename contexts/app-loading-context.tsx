import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import { useAppTheme } from '@/contexts/app-theme-context';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';

const BOOTSTRAP_MIN_MS = 350;

type AppLoadingContextValue = {
  markAppReady: () => void;
};

const AppLoadingContext = createContext<AppLoadingContextValue | null>(null);

export function AppLoadingProvider({ children }: { children: React.ReactNode }) {
  const { isReady: themeReady } = useAppTheme();
  const [appReady, setAppReady] = useState(false);
  const [bootstrapDone, setBootstrapDone] = useState(false);

  const markAppReady = useCallback(() => {
    setAppReady(true);
  }, []);

  useEffect(() => {
    if (!themeReady || !appReady || bootstrapDone) {
      return;
    }

    const timer = setTimeout(() => setBootstrapDone(true), BOOTSTRAP_MIN_MS);
    return () => clearTimeout(timer);
  }, [themeReady, appReady, bootstrapDone]);

  const isVisible = !bootstrapDone;

  const value = useMemo(() => ({ markAppReady }), [markAppReady]);

  return (
    <AppLoadingContext.Provider value={value}>
      <View style={styles.root}>
        {children}
        {isVisible ? (
          <View style={styles.overlay} pointerEvents="auto">
            <AppLoadingScreen />
          </View>
        ) : null}
      </View>
    </AppLoadingContext.Provider>
  );
}

export function useAppLoading(): AppLoadingContextValue {
  const context = useContext(AppLoadingContext);
  if (!context) {
    throw new Error('useAppLoading must be used within AppLoadingProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 9999,
  },
});
