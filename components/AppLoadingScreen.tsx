import { useAppTheme } from '@/contexts/app-theme-context';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function AppLoadingScreen() {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.logo, { color: colors.text }]}>LC</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    fontSize: 52,
    fontWeight: '700',
    letterSpacing: 6,
  },
});
