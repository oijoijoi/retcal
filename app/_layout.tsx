import { AppLoadingProvider } from '@/contexts/app-loading-context';
import { AppThemeProvider, useAppTheme } from '@/contexts/app-theme-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import '../global.css';

export const unstable_settings = {
  anchor: 'index',
};

function NavigationTheme() {
  const { resolved, colors } = useAppTheme();
  const navTheme = resolved === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...navTheme,
        colors: {
          ...navTheme.colors,
          background: colors.background,
          card: colors.surface,
          text: colors.text,
          border: colors.border,
          primary: colors.accent,
        },
      }}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-period"
          options={{ presentation: 'modal', headerShown: false }}
        />
      </Stack>
      <StatusBar style={resolved === 'dark' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppThemeProvider>
        <AppLoadingProvider>
          <NavigationTheme />
        </AppLoadingProvider>
      </AppThemeProvider>
    </GestureHandlerRootView>
  );
}
