import { SegmentedControl } from '@/components/SegmentedControl';
import { DateInputField } from '@/components/ui/date-input-field';
import type {
  GridScalePreference,
  ThemePreference,
} from '@/constants/app-theme';
import { useAppTheme } from '@/contexts/app-theme-context';
import { saveGridScalePreference } from '@/lib/app-settings';
import {
  clearBirthDate,
  formatBirthDateInput,
  loadBirthDate,
  parseBirthDateInput,
  saveBirthDate,
} from '@/lib/birth-date';
import {
  clearGridArrays,
  saveGridArraysFromBirthDate,
} from '@/lib/grid-arrays';
import { clearPeriods, ensurePeriodsPalleteInitialized } from '@/lib/periods';
import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type AppMenuProps = {
  visible: boolean;
  onClose: () => void;
  gridScale: GridScalePreference;
  onGridScaleChange: (value: GridScalePreference) => void;
  onBirthDateSaved?: () => void;
  onDataReset?: () => void;
};

const THEME_OPTIONS = [
  { value: 'light' as const, label: 'Светлая' },
  { value: 'dark' as const, label: 'Тёмная' },
  { value: 'system' as const, label: 'Системная' },
];

const GRID_OPTIONS = [
  { value: 'months' as const, label: 'По месяцам' },
  { value: 'weeks' as const, label: 'По неделям' },
];

export function AppMenu({
  visible,
  onClose,
  gridScale,
  onGridScaleChange,
  onBirthDateSaved,
  onDataReset,
}: AppMenuProps) {
  const insets = useSafeAreaInsets();
  const { colors, preference, setPreference } = useAppTheme();
  const [birthDate, setBirthDate] = useState('');

  const loadSavedBirthDate = useCallback(async () => {
    const savedDate = await loadBirthDate();
    if (savedDate) {
      setBirthDate(formatBirthDateInput(savedDate));
    } else {
      setBirthDate('');
    }
  }, []);

  useEffect(() => {
    if (visible) {
      void loadSavedBirthDate();
    }
  }, [visible, loadSavedBirthDate]);

  const handleSaveBirthDate = async () => {
    if (!birthDate) {
      Alert.alert('Ошибка', 'Пожалуйста, введите дату рождения');
      return;
    }

    const date = parseBirthDateInput(birthDate);
    if (!date) {
      Alert.alert('Ошибка', 'Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }

    if (date > new Date()) {
      Alert.alert('Ошибка', 'Дата рождения не может быть в будущем');
      return;
    }

    await saveBirthDate(date);
    await ensurePeriodsPalleteInitialized();
    await saveGridArraysFromBirthDate(date);
    onBirthDateSaved?.();
    Alert.alert('Готово', 'Дата рождения сохранена');
  };

  const handleGridScaleChange = (value: GridScalePreference) => {
    onGridScaleChange(value);
    void saveGridScalePreference(value);
  };

  const handleThemeChange = (value: ThemePreference) => {
    setPreference(value);
  };

  const handleReset = () => {
    Alert.alert(
      'Сбросить данные?',
      'Сохранённые дата рождения и периоды будут удалены.',
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
            onDataReset?.();
            Alert.alert('Готово', 'Данные сброшены');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.panel,
            {
              backgroundColor: colors.surface,
              paddingTop: insets.top + 12,
              paddingBottom: insets.bottom + 16,
            },
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={[styles.panelTitle, { color: colors.text }]}>
              Настройки
            </Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Тема
            </Text>
            <SegmentedControl
              options={THEME_OPTIONS}
              value={preference}
              onChange={handleThemeChange}
            />

            <Text
              style={[
                styles.sectionLabel,
                styles.sectionSpacing,
                { color: colors.text },
              ]}
            >
              Масштаб сетки
            </Text>
            <SegmentedControl
              options={GRID_OPTIONS}
              value={gridScale}
              onChange={handleGridScaleChange}
            />

            <Text
              style={[
                styles.sectionLabel,
                styles.sectionSpacing,
                { color: colors.text },
              ]}
            >
              Дата рождения
            </Text>
            <DateInputField
              value={birthDate}
              onChange={setBirthDate}
              pickerTitle="Выберите дату рождения"
              maximumDate={new Date()}
              defaultPickerDate={new Date(1990, 0, 1)}
            />

            <Pressable
              onPress={() => void handleSaveBirthDate()}
              style={[styles.primaryBtn, { backgroundColor: colors.accent }]}
            >
              <Text style={styles.primaryBtnText}>Сохранить дату</Text>
            </Pressable>

            <Pressable
              onPress={handleReset}
              style={[
                styles.resetBtn,
                {
                  borderColor: colors.danger,
                  backgroundColor: colors.dangerSurface,
                },
              ]}
            >
              <Text style={[styles.resetBtnText, { color: colors.danger }]}>
                Сбросить данные
              </Text>
            </Pressable>

            <View style={[styles.aboutBox, { borderColor: colors.border }]}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>
                О приложении
              </Text>
              <Text style={[styles.aboutText, { color: colors.textSecondary }]}>
                Retro Calendar визуализирует прожитое время в виде сетки недель
                и месяцев. Укажите дату рождения, чтобы увидеть свой прогресс.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  panel: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  panelTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
  },
  sectionSpacing: {
    marginTop: 22,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  resetBtn: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 22,
  },
  resetBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  aboutBox: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    padding: 14,
  },
  aboutTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  aboutText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
