import {
  clearBirthDate,
  formatBirthDateInput,
  loadBirthDate,
  parseBirthDateInput,
  saveBirthDate,
} from '@/lib/birth-date';
import { clearGridArrays, saveGridArraysFromBirthDate } from '@/lib/grid-arrays';
import { clearPeriods, ensurePeriodsPalleteInitialized } from '@/lib/periods';
import { getWeeksPassedFromBirthDate } from '@/lib/weeks';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const [birthDate, setBirthDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDraftDate, setPickerDraftDate] = useState(new Date(1990, 0, 1));
  const parsedBirthDate = useMemo(
    () => parseBirthDateInput(birthDate),
    [birthDate]
  );
  const weeksPreview = useMemo(() => {
    if (!parsedBirthDate) {
      return null;
    }

    if (parsedBirthDate > new Date()) {
      return null;
    }

    return getWeeksPassedFromBirthDate(parsedBirthDate);
  }, [parsedBirthDate]);

  useEffect(() => {
    const loadSavedBirthDate = async () => {
      const savedDate = await loadBirthDate();
      if (savedDate) {
        setBirthDate(formatBirthDateInput(savedDate));
      }
    };

    void loadSavedBirthDate();
  }, []);

  const handleSave = async () => {
    if (!birthDate) {
      Alert.alert('Ошибка', 'Пожалуйста, введите дату рождения');
      return;
    }

    const date = parseBirthDateInput(birthDate);
    if (!date) {
      Alert.alert('Ошибка', 'Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }

    const now = new Date();
    if (date > now) {
      Alert.alert('Ошибка', 'Дата рождения не может быть в будущем');
      return;
    }

    await saveBirthDate(date);
    await ensurePeriodsPalleteInitialized();
    await saveGridArraysFromBirthDate(date);

    Alert.alert('Успех', 'Дата рождения сохранена!', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  const handleBirthDateChange = (text: string) => {
    const digits = text.replace(/\D/g, '').slice(0, 8);
    const day = digits.slice(0, 2);
    const month = digits.slice(2, 4);
    const year = digits.slice(4, 8);

    if (digits.length <= 2) {
      setBirthDate(day);
      return;
    }

    if (digits.length <= 4) {
      setBirthDate(`${day}.${month}`);
      return;
    }

    setBirthDate(`${day}.${month}.${year}`);
  };

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

  const handleOpenDatePicker = () => {
    setPickerDraftDate(parsedBirthDate ?? new Date(1990, 0, 1));
    setShowDatePicker(true);
  };

  const handleConfirmDatePicker = () => {
    setBirthDate(formatBirthDateInput(pickerDraftDate));
    setShowDatePicker(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Сбросить данные?',
      'Сохраненные дата рождения и периоды будут удалены. Продолжить?',
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Сбросить',
          style: 'destructive',
          onPress: async () => {
            await clearBirthDate();
            await clearPeriods();
            await clearGridArrays();
            setBirthDate('');
            Alert.alert('Готово', 'Сохраненные данные сброшены', [
              { text: 'OK', onPress: () => router.back() },
            ]);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Заголовок */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </Pressable>
          <Text style={styles.title}>Настройки</Text>
        </View>

        {/* Форма */}
        <View style={styles.form}>
          <Text style={styles.label}>Дата рождения</Text>
          <Text style={styles.description}>
            Введите дату рождения для расчета сетки недель
          </Text>

          <View style={styles.inputWrap}>
            <TextInput
              value={birthDate}
              onChangeText={handleBirthDateChange}
              placeholder="ДД.ММ.ГГГГ (например: 01.01.1990)"
              style={styles.input}
              keyboardType="numeric"
              maxLength={10}
            />
            <Pressable
              onPress={handleOpenDatePicker}
              style={styles.calendarButton}
              hitSlop={8}
            >
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
            </Pressable>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewTitle}>Наглядно для разработки</Text>
            <Text style={styles.previewValue}>
              {weeksPreview === null
                ? 'Прошло недель: -'
                : `Прошло недель: ${weeksPreview}`}
            </Text>
          </View>

          <Pressable onPress={handleSave} style={styles.saveButton}>
            <Text style={styles.saveButtonText}>Сохранить</Text>
          </Pressable>

          <Pressable onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Сбросить данные</Text>
          </Pressable>
        </View>
      </View>
      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Выберите дату рождения</Text>
            <DateTimePicker
              value={pickerDraftDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
              onChange={handleDatePickerChange}
              maximumDate={new Date()}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowDatePicker(false)}
                style={styles.modalCancelButton}
              >
                <Text style={styles.modalCancelText}>Отмена</Text>
              </Pressable>
              <Pressable
                onPress={handleConfirmDatePicker}
                style={styles.modalConfirmButton}
              >
                <Text style={styles.modalConfirmText}>Выбрать</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  form: {
    flex: 1,
    paddingTop: 24,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 16,
  },
  inputWrap: {
    position: 'relative',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 18,
    paddingRight: 48,
  },
  calendarButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 18,
  },
  resetButton: {
    marginTop: 12,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  resetButtonText: {
    color: '#b91c1c',
    fontWeight: '600',
    fontSize: 16,
  },
  previewBox: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  previewTitle: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 4,
  },
  previewValue: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17,24,39,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalCard: {
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  modalCancelButton: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalCancelText: {
    color: '#374151',
    fontWeight: '600',
  },
  modalConfirmButton: {
    borderRadius: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  modalConfirmText: {
    color: '#fff',
    fontWeight: '600',
  },
});
