import { useAppTheme } from '@/contexts/app-theme-context';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type SegmentedOption<T extends string> = {
  value: T;
  label: string;
};

type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.track,
        { backgroundColor: colors.background, borderColor: colors.border },
      ]}
    >
      {options.map(option => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected
                ? { backgroundColor: colors.surface, borderColor: colors.border }
                : null,
            ]}
          >
            <Text
              style={[
                styles.segmentText,
                { color: selected ? colors.text : colors.textSecondary },
              ]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 3,
    gap: 4,
  },
  segment: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'transparent',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});
