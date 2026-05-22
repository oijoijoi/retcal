import { DateInputField } from '@/components/ui/date-input-field';
import { useAppTheme } from '@/contexts/app-theme-context';
import {
  loadBirthDate,
  parseBirthDateInput,
  saveBirthDate,
} from '@/lib/birth-date';
import {
  loadGridArrays,
  saveEmptyGridArrays,
  saveGridArraysFromBirthDate,
} from '@/lib/grid-arrays';
import {
  canCreateCareerPeriod,
  createOnboardingPeriod,
  getAgeYears,
  getOnboardingCareerEndDate,
  getOnboardingStepsForAge,
  type OnboardingStepId,
  validateMilestoneDate,
} from '@/lib/onboarding-flow';
import { ensurePeriodsPalleteInitialized } from '@/lib/periods';
import { type Href, router } from 'expo-router';
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
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type StepContent = {
  title: string;
  subtitle: string;
  pickerTitle: string;
  defaultPickerDate: Date;
};

const STEP_CONTENT: Record<
  Exclude<OnboardingStepId, 'birth' | 'done'>,
  StepContent
> = {
  school: {
    title: 'Школа',
    subtitle: 'Когда вы пошли в школу?',
    pickerTitle: 'Начало школы',
    defaultPickerDate: new Date(2010, 8, 1),
  },
  university: {
    title: 'После школы',
    subtitle: 'Когда вы поступили в вуз, колледж и т.д.?',
    pickerTitle: 'Поступление',
    defaultPickerDate: new Date(2018, 8, 1),
  },
  career: {
    title: 'Карьера',
    subtitle: 'Когда вы начали работать?',
    pickerTitle: 'Начало работы',
    defaultPickerDate: new Date(2022, 5, 1),
  },
};

export default function OnboardingScreen() {
  const { colors } = useAppTheme();
  const [step, setStep] = useState<OnboardingStepId>('birth');
  const [steps, setSteps] = useState<OnboardingStepId[]>(['birth', 'done']);
  const [birthDateValue, setBirthDateValue] = useState<Date | null>(null);
  const [birthDateInput, setBirthDateInput] = useState('');
  const [schoolDateInput, setSchoolDateInput] = useState('');
  const [universityDateInput, setUniversityDateInput] = useState('');
  const [careerDateInput, setCareerDateInput] = useState('');
  const [schoolDateValue, setSchoolDateValue] = useState<Date | null>(null);
  const [universityDateValue, setUniversityDateValue] = useState<Date | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    void Promise.all([loadBirthDate(), loadGridArrays()]).then(
      ([savedBirth, grid]) => {
        if (savedBirth || grid) {
          router.replace('/(tabs)' as Href);
        }
      }
    );
  }, []);

  const stepIndex = useMemo(
    () => Math.max(0, steps.indexOf(step)),
    [step, steps]
  );

  const goToTabs = useCallback(() => {
    router.replace('/(tabs)' as Href);
  }, []);

  const handleSkip = async () => {
    Keyboard.dismiss();
    setIsSaving(true);
    try {
      await ensurePeriodsPalleteInitialized();
      await saveEmptyGridArrays();
      goToTabs();
    } finally {
      setIsSaving(false);
    }
  };

  const parseStepDate = (input: string): Date | null => {
    return parseBirthDateInput(input);
  };

  const handleBirthContinue = async () => {
    Keyboard.dismiss();
    setDateError(null);
    const date = parseStepDate(birthDateInput);
    if (!date) {
      setDateError('Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }
    if (date > new Date()) {
      setDateError('Дата рождения не может быть в будущем');
      return;
    }

    setIsSaving(true);
    try {
      await saveBirthDate(date);
      await ensurePeriodsPalleteInitialized();
      await saveGridArraysFromBirthDate(date);

      const age = getAgeYears(date);
      const nextSteps = getOnboardingStepsForAge(age);
      setBirthDateValue(date);
      setSteps(nextSteps);

      const nextStep = nextSteps[1] ?? 'done';
      setStep(nextStep);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить дату рождения');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSchoolContinue = async () => {
    if (!birthDateValue) {
      return;
    }
    Keyboard.dismiss();
    setDateError(null);
    const schoolDate = parseStepDate(schoolDateInput);
    if (!schoolDate) {
      setDateError('Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }
    const validationError = validateMilestoneDate(
      schoolDate,
      birthDateValue,
      'Дата начала школы'
    );
    if (validationError) {
      setDateError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await createOnboardingPeriod('дошкольный', birthDateValue, schoolDate);
      setSchoolDateValue(schoolDate);
      const nextStep = steps[steps.indexOf('school') + 1] ?? 'done';
      setStep(nextStep);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить период');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUniversityContinue = async () => {
    if (!schoolDateValue) {
      return;
    }
    Keyboard.dismiss();
    setDateError(null);
    const universityDate = parseStepDate(universityDateInput);
    if (!universityDate) {
      setDateError('Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }
    const validationError = validateMilestoneDate(
      universityDate,
      schoolDateValue,
      'Дата поступления'
    );
    if (validationError) {
      setDateError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await createOnboardingPeriod('школьный', schoolDateValue, universityDate);
      setUniversityDateValue(universityDate);
      const nextStep = steps[steps.indexOf('university') + 1] ?? 'done';
      setStep(nextStep);
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить период');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCareerContinue = async () => {
    if (!universityDateValue || !birthDateValue) {
      return;
    }
    Keyboard.dismiss();
    setDateError(null);
    const careerDate = parseStepDate(careerDateInput);
    if (!careerDate) {
      setDateError('Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }
    const validationError = validateMilestoneDate(
      careerDate,
      universityDateValue,
      'Дата начала работы'
    );
    if (validationError) {
      setDateError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await createOnboardingPeriod('карьера', universityDateValue, careerDate);
      if (canCreateCareerPeriod(careerDate, birthDateValue)) {
        const careerEnd = getOnboardingCareerEndDate(birthDateValue);
        await createOnboardingPeriod('Карьера', careerDate, careerEnd);
      }
      setStep('done');
    } catch {
      Alert.alert('Ошибка', 'Не удалось сохранить период');
    } finally {
      setIsSaving(false);
    }
  };

  const handleContinue = () => {
    setDateError(null);
    if (step === 'birth') {
      void handleBirthContinue();
      return;
    }
    if (step === 'school') {
      void handleSchoolContinue();
      return;
    }
    if (step === 'university') {
      void handleUniversityContinue();
      return;
    }
    if (step === 'career') {
      void handleCareerContinue();
      return;
    }
    goToTabs();
  };

  const continueLabel = useMemo(() => {
    if (isSaving) {
      return 'Сохранение…';
    }
    if (step === 'done') {
      return 'Начать';
    }
    return 'Продолжить';
  }, [isSaving, step]);

  const minimumMilestoneDate = useMemo(() => {
    if (step === 'school' && birthDateValue) {
      return birthDateValue;
    }
    if (step === 'university' && schoolDateValue) {
      return schoolDateValue;
    }
    if (step === 'career' && universityDateValue) {
      return universityDateValue;
    }
    return undefined;
  }, [birthDateValue, schoolDateValue, step, universityDateValue]);

  const renderBody = () => {
    if (step === 'birth') {
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>
            Когда вы родились?
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Дата нужна, чтобы построить сетку прожитых недель и месяцев. Её
            можно изменить позже в меню.
          </Text>
          <DateInputField
            value={birthDateInput}
            onChange={value => {
              setBirthDateInput(value);
              setDateError(null);
            }}
            pickerTitle="Дата рождения"
            maximumDate={new Date()}
            defaultPickerDate={new Date(1995, 10, 18)}
            error={dateError}
          />
        </>
      );
    }

    if (step === 'done') {
      return (
        <>
          <Text style={[styles.title, { color: colors.text }]}>Готово</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Вы можете редактировать и добавлять периоды в меню легенды.
          </Text>
        </>
      );
    }

    const content = STEP_CONTENT[step];
    const value =
      step === 'school'
        ? schoolDateInput
        : step === 'university'
          ? universityDateInput
          : careerDateInput;
    const onChange =
      step === 'school'
        ? setSchoolDateInput
        : step === 'university'
          ? setUniversityDateInput
          : setCareerDateInput;

    return (
      <>
        <Text style={[styles.title, { color: colors.text }]}>
          {content.title}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {content.subtitle}
        </Text>
        <DateInputField
          value={value}
          onChange={text => {
            onChange(text);
            setDateError(null);
          }}
          pickerTitle={content.pickerTitle}
          minimumDate={minimumMilestoneDate}
          maximumDate={new Date()}
          defaultPickerDate={content.defaultPickerDate}
          error={dateError}
        />
      </>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.topRow}>
              <View style={styles.stepDots}>
                {steps.map((stepId, index) => (
                  <View
                    key={stepId}
                    style={[
                      styles.stepDot,
                      {
                        backgroundColor:
                          index <= stepIndex ? colors.accent : colors.cellBase,
                        flex: index === stepIndex ? 2 : 1,
                      },
                    ]}
                  />
                ))}
              </View>
              {step === 'birth' ? (
                <Pressable
                  onPress={() => void handleSkip()}
                  disabled={isSaving}
                  hitSlop={8}
                >
                  <Text
                    style={[styles.skipText, { color: colors.textSecondary }]}
                  >
                    Пропустить
                  </Text>
                </Pressable>
              ) : (
                <View style={styles.skipPlaceholder} />
              )}
            </View>

            <View style={styles.body}>{renderBody()}</View>

            <Pressable
              onPress={handleContinue}
              disabled={isSaving}
              style={[
                styles.continueBtn,
                { backgroundColor: colors.accent, opacity: isSaving ? 0.7 : 1 },
              ]}
            >
              <Text style={styles.continueText}>{continueLabel}</Text>
            </Pressable>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingTop: 8,
    marginBottom: 32,
  },
  stepDots: {
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  stepDot: {
    height: 4,
    borderRadius: 2,
  },
  skipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  skipPlaceholder: {
    width: 72,
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    minHeight: 280,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 28,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  continueText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
  },
});
