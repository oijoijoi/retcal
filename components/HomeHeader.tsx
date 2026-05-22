import { LifeProgressBar } from '@/components/LifeProgressBar';
import { useAppTheme } from '@/contexts/app-theme-context';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

type HomeHeaderProps = {
  birthDate: Date | null;
  onMenuPress: () => void;
};

export function HomeHeader({ birthDate, onMenuPress }: HomeHeaderProps) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onMenuPress}
        style={[
          styles.menuButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
        hitSlop={6}
      >
        <Ionicons name="menu" size={20} color={colors.text} />
      </Pressable>
      <LifeProgressBar birthDate={birthDate} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
});
