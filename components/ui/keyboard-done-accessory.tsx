import { useAppTheme } from '@/contexts/app-theme-context';
import React from 'react';
import {
  InputAccessoryView,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export const DATE_INPUT_ACCESSORY_ID = 'date-input-keyboard-done';

export function DateInputKeyboardAccessory() {
  const { colors } = useAppTheme();

  if (Platform.OS !== 'ios') {
    return null;
  }

  return (
    <InputAccessoryView nativeID={DATE_INPUT_ACCESSORY_ID}>
      <View
        style={[
          styles.bar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
          },
        ]}
      >
        <Pressable onPress={Keyboard.dismiss} hitSlop={8}>
          <Text style={[styles.done, { color: colors.accent }]}>Готово</Text>
        </Pressable>
      </View>
    </InputAccessoryView>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  done: {
    fontSize: 17,
    fontWeight: '600',
  },
});
