import { DateInputField } from '@/components/ui/date-input-field';
import {
  PeriodColorPicker,
  useDefaultPeriodColor,
} from '@/components/ui/period-color-picker';
import { DEFAULT_PERIODS_PALLETE } from '@/constants/models';
import { resolvePeriodColorPair } from '@/constants/period-colors';
import { useAppTheme } from '@/contexts/app-theme-context';
import {
  isDateBeforeDay,
  loadBirthDate,
  parseBirthDateInput,
} from '@/lib/birth-date';
import { getPeriodColor } from '@/lib/period-display';
import {
  getPeriodById,
  getPeriodDurations,
  loadPeriodsPallete,
  savePeriod,
  updatePeriod,
} from '@/lib/periods';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AddPeriodScreen() {
  const insets = useSafeAreaInsets();
  const { colors, resolved } = useAppTheme();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const periodId = typeof id === 'string' ? id : undefined;
  const isEditMode = Boolean(periodId);
  const defaultColor = useDefaultPeriodColor();
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [showErrors, setShowErrors] = useState(false);
  const [birthDate, setBirthDate] = useState<Date | null>(null);

  const resetForm = useCallback(() => {
    setTitle('');
    setStartDate('');
    setEndDate('');
    setSelectedColor(defaultColor);
    setShowErrors(false);
  }, [defaultColor]);

  useFocusEffect(
    useCallback(() => {
      if (periodId) {
        void (async () => {
          const [period, palette] = await Promise.all([
            getPeriodById(periodId),
            loadPeriodsPallete(),
          ]);
          if (!period) {
            router.back();
            return;
          }
          setTitle(period.title);
          setStartDate(period.startDate);
          setEndDate(period.endDate);
          setSelectedColor(
            getPeriodColor(
              palette ?? DEFAULT_PERIODS_PALLETE,
              period.paletteId,
              resolved
            )
          );
          setShowErrors(false);
        })();
        return;
      }
      resetForm();
    }, [periodId, resetForm, resolved])
  );

  useEffect(() => {
    void loadBirthDate().then(setBirthDate);
  }, []);

  const parsedStart = useMemo(
    () => parseBirthDateInput(startDate),
    [startDate]
  );
  const parsedEnd = useMemo(() => parseBirthDateInput(endDate), [endDate]);

  const hasDateRangeError = Boolean(
    parsedStart && parsedEnd && parsedStart > parsedEnd
  );

  const startBeforeBirth = Boolean(
    birthDate && parsedStart && isDateBeforeDay(parsedStart, birthDate)
  );
  const endBeforeBirth = Boolean(
    birthDate && parsedEnd && isDateBeforeDay(parsedEnd, birthDate)
  );

  const startMaximumDate = useMemo(() => {
    const today = new Date();
    if (parsedEnd && parsedEnd < today) {
      return parsedEnd;
    }
    return today;
  }, [parsedEnd]);

  const endMinimumDate = useMemo(() => {
    if (!birthDate) {
      return parsedStart ?? undefined;
    }
    if (parsedStart && !isDateBeforeDay(parsedStart, birthDate)) {
      return parsedStart;
    }
    return birthDate;
  }, [birthDate, parsedStart]);

  const titleError = useMemo(() => {
    if (!showErrors) {
      return null;
    }
    if (!title.trim()) {
      return 'Укажите название периода';
    }
    return null;
  }, [showErrors, title]);

  const startDateError = useMemo(() => {
    if (startDate && !parsedStart) {
      return 'Введите дату в формате ДД.ММ.ГГГГ';
    }
    if (startBeforeBirth) {
      return 'Не может быть раньше даты рождения';
    }
    if (hasDateRangeError) {
      return 'Не может быть позже даты окончания';
    }
    if (showErrors && !startDate) {
      return 'Укажите дату начала';
    }
    return null;
  }, [startDate, parsedStart, startBeforeBirth, hasDateRangeError, showErrors]);

  const endDateError = useMemo(() => {
    if (endDate && !parsedEnd) {
      return 'Введите дату в формате ДД.ММ.ГГГГ';
    }
    if (endBeforeBirth) {
      return 'Не может быть раньше даты рождения';
    }
    if (hasDateRangeError) {
      return 'Не может быть раньше даты начала';
    }
    if (showErrors && !endDate) {
      return 'Укажите дату окончания';
    }
    return null;
  }, [endDate, parsedEnd, endBeforeBirth, hasDateRangeError, showErrors]);

  const handleSave = () => {
    Keyboard.dismiss();
    setShowErrors(true);

    if (
      !birthDate ||
      !title.trim() ||
      !startDate ||
      !endDate ||
      !parsedStart ||
      !parsedEnd ||
      startBeforeBirth ||
      endBeforeBirth ||
      hasDateRangeError
    ) {
      return;
    }

    const start = parsedStart;
    const end = parsedEnd;

    const { durationWeeks, durationMonths } = getPeriodDurations(start, end);
    const { light, dark } = resolvePeriodColorPair(selectedColor, resolved);

    const payload = {
      title,
      startDate,
      endDate,
      lightColor: light,
      darkColor: dark,
      durationWeeks,
      durationMonths,
    };

    const savePromise =
      isEditMode && periodId
        ? updatePeriod(periodId, payload)
        : savePeriod(payload);

    void savePromise
      .then(() => {
        if (!isEditMode) {
          resetForm();
        }
        Alert.alert(
          'Готово',
          isEditMode ? 'Период обновлён' : 'Период добавлен',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      })
      .catch(() => {
        Alert.alert(
          'Ошибка',
          'Не удалось сохранить период. Укажите дату рождения в настройках.'
        );
      });
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.surface }]}>
      <View
        style={[
          styles.panel,
          {
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <View style={styles.panelHeader}>
          <Text style={[styles.panelTitle, { color: colors.text }]}>
            {isEditMode ? 'Редактировать период' : 'Добавить период'}
          </Text>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top + 12 : 0}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Название
            </Text>
            <View
              style={[
                styles.inputWrap,
                titleError ? styles.inputWrapError : null,
                {
                  backgroundColor: colors.background,
                  borderColor: titleError ? colors.danger : colors.border,
                },
              ]}
            >
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Например: Работа в компании X"
                placeholderTextColor={colors.textSecondary}
                style={[styles.input, { color: colors.text }]}
                returnKeyType="done"
                blurOnSubmit
                onSubmitEditing={Keyboard.dismiss}
              />
            </View>
            {titleError ? (
              <Text style={[styles.fieldError, { color: colors.danger }]}>
                {titleError}
              </Text>
            ) : null}

            <Text
              style={[
                styles.sectionLabel,
                styles.sectionSpacing,
                { color: colors.text },
              ]}
            >
              Дата начала
            </Text>
            <DateInputField
              value={startDate}
              onChange={setStartDate}
              pickerTitle="Дата начала"
              minimumDate={birthDate ?? undefined}
              maximumDate={startMaximumDate}
              defaultPickerDate={birthDate ?? new Date(1990, 0, 1)}
              error={startDateError}
            />

            <Text
              style={[
                styles.sectionLabel,
                styles.sectionSpacing,
                { color: colors.text },
              ]}
            >
              Дата окончания
            </Text>
            <DateInputField
              value={endDate}
              onChange={setEndDate}
              pickerTitle="Дата окончания"
              minimumDate={endMinimumDate}
              maximumDate={new Date()}
              defaultPickerDate={birthDate ?? new Date(1990, 0, 1)}
              error={endDateError}
            />
            {!birthDate ? (
              <Text style={[styles.fieldError, { color: colors.danger }]}>
                Укажите дату рождения в настройках, чтобы добавить период
              </Text>
            ) : null}

            <Text
              style={[
                styles.sectionLabel,
                styles.sectionSpacing,
                { color: colors.text },
              ]}
            >
              Цвет
            </Text>
            <PeriodColorPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />

            <Pressable
              onPress={handleSave}
              style={[
                styles.primaryBtn,
                styles.saveBtn,
                { backgroundColor: colors.accent },
              ]}
            >
              <Text style={styles.primaryBtnText}>
                {isEditMode ? 'Сохранить изменения' : 'Сохранить период'}
              </Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  panel: {
    flex: 1,
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
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  inputWrapError: {
    borderWidth: 1.5,
  },
  input: {
    fontSize: 17,
    paddingVertical: 14,
  },
  fieldError: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
    marginLeft: 2,
  },
  primaryBtn: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtn: {
    marginTop: 28,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
