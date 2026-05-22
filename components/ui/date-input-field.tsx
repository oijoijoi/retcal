import {
  DATE_INPUT_ACCESSORY_ID,
  DateInputKeyboardAccessory,
} from '@/components/ui/keyboard-done-accessory';
import { useAppTheme } from '@/contexts/app-theme-context';
import {
  formatBirthDateInput,
  formatMaskedDateInput,
  parseBirthDateInput,
} from '@/lib/birth-date';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import React, { useMemo, useState } from 'react';
import {
  Keyboard,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

type DateInputFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  pickerTitle?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  defaultPickerDate?: Date;
  error?: string | null;
};

export function DateInputField({
  value,
  onChange,
  placeholder = 'ДД.ММ.ГГГГ',
  pickerTitle = 'Выберите дату',
  minimumDate,
  maximumDate,
  defaultPickerDate = new Date(1990, 0, 1),
  error = null,
}: DateInputFieldProps) {
  const { colors, resolved } = useAppTheme();
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDraftDate, setPickerDraftDate] = useState(defaultPickerDate);

  const parsedDate = useMemo(() => parseBirthDateInput(value), [value]);

  const handleDatePickerChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    if (event.type === 'dismissed') {
      return;
    }
    if (selectedDate) {
      setPickerDraftDate(selectedDate);
    }
  };

  const openPicker = () => {
    setPickerDraftDate(parsedDate ?? defaultPickerDate);
    setShowDatePicker(true);
  };

  const hasError = Boolean(error);

  return (
    <>
      <View style={styles.field}>
        <View
          style={[
            styles.inputWrap,
            hasError ? styles.inputWrapWithError : styles.inputWrapDefault,
            {
              backgroundColor: colors.background,
              borderColor: hasError ? colors.danger : colors.border,
            },
          ]}
        >
        <TextInput
          value={value}
          onChangeText={text => onChange(formatMaskedDateInput(text))}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          style={[styles.input, { color: colors.text }]}
          keyboardType="number-pad"
          inputAccessoryViewID={DATE_INPUT_ACCESSORY_ID}
          returnKeyType="done"
          blurOnSubmit
          onSubmitEditing={() => Keyboard.dismiss()}
          maxLength={10}
        />
        <Pressable onPress={openPicker} hitSlop={8} style={styles.calendarBtn}>
          <Ionicons
            name="calendar-outline"
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
        </View>
        {hasError ? (
          <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
        ) : null}
      </View>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View
          style={[styles.pickerBackdrop, { backgroundColor: colors.overlay }]}
        >
          <View
            style={[styles.pickerCard, { backgroundColor: colors.surface }]}
          >
            <Text style={[styles.pickerTitle, { color: colors.text }]}>
              {pickerTitle}
            </Text>
            <DateTimePicker
              value={pickerDraftDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={handleDatePickerChange}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              themeVariant={resolved === 'dark' ? 'dark' : 'light'}
            />
            <View style={styles.pickerActions}>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={[styles.pickerCancel, { borderColor: colors.border }]}
              >
                <Text style={{ color: colors.textSecondary }}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  onChange(formatBirthDateInput(pickerDraftDate));
                  setShowDatePicker(false);
                }}
                style={[
                  styles.pickerConfirm,
                  { backgroundColor: colors.accent },
                ]}
              >
                <Text style={styles.pickerConfirmText}>Выбрать</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
      <DateInputKeyboardAccessory />
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    marginBottom: 12,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  inputWrapDefault: {
    marginBottom: 0,
  },
  inputWrapWithError: {
    borderWidth: 1.5,
  },
  errorText: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 6,
    marginLeft: 2,
  },
  input: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 14,
    paddingRight: 8,
  },
  calendarBtn: {
    padding: 4,
  },
  pickerBackdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  pickerCard: {
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  pickerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  pickerCancel: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pickerConfirm: {
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  pickerConfirmText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
