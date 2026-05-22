import {
  DARK_PERIOD_COLOR_GRID,
  LIGHT_PERIOD_COLOR_GRID,
} from '@/constants/period-colors';
import {
  formatBirthDateInput,
  isDateBeforeDay,
  startOfCalendarDay,
} from '@/lib/birth-date';
import { getYearsLived } from '@/lib/life-progress';
import {
  getPeriodDurations,
  savePeriod,
  type SavePeriodInput,
} from '@/lib/periods';

export type OnboardingStepId =
  | 'birth'
  | 'school'
  | 'university'
  | 'career'
  | 'done';

export function getOnboardingStepsForAge(ageYears: number): OnboardingStepId[] {
  const steps: OnboardingStepId[] = ['birth'];
  if (ageYears > 7) {
    steps.push('school');
  }
  if (ageYears > 19) {
    steps.push('university');
  }
  if (ageYears > 24) {
    steps.push('career');
  }
  steps.push('done');
  return steps;
}

export function pickRandomPeriodColors(): { light: string; dark: string } {
  const index = Math.floor(Math.random() * LIGHT_PERIOD_COLOR_GRID.length);
  return {
    light: LIGHT_PERIOD_COLOR_GRID[index],
    dark: DARK_PERIOD_COLOR_GRID[index],
  };
}

export async function createOnboardingPeriod(
  title: string,
  start: Date,
  end: Date
): Promise<void> {
  const { light, dark } = pickRandomPeriodColors();
  const { durationWeeks, durationMonths } = getPeriodDurations(start, end);
  const input: SavePeriodInput = {
    title,
    startDate: formatBirthDateInput(start),
    endDate: formatBirthDateInput(end),
    lightColor: light,
    darkColor: dark,
    durationWeeks,
    durationMonths,
  };
  await savePeriod(input);
}

export function validateMilestoneDate(
  date: Date,
  minDate: Date,
  label: string
): string | null {
  const today = startOfCalendarDay(new Date());
  if (date > today) {
    return `${label} не может быть в будущем`;
  }
  if (isDateBeforeDay(date, minDate)) {
    return `${label} не может быть раньше ${formatBirthDateInput(minDate)}`;
  }
  return null;
}

export function getAgeYears(birthDate: Date, referenceDate = new Date()): number {
  return getYearsLived(birthDate, referenceDate);
}

const CAREER_PERIOD_MAX_AGE_YEARS = 62;

export function getDateAtAgeYears(birthDate: Date, years: number): Date {
  const anniversary = new Date(birthDate);
  anniversary.setFullYear(birthDate.getFullYear() + years);
  return startOfCalendarDay(anniversary);
}

export function getOnboardingCareerEndDate(birthDate: Date): Date {
  const ageLimitDate = getDateAtAgeYears(birthDate, CAREER_PERIOD_MAX_AGE_YEARS);
  const today = startOfCalendarDay(new Date());
  return ageLimitDate < today ? ageLimitDate : today;
}

export function canCreateCareerPeriod(
  careerStart: Date,
  birthDate: Date
): boolean {
  const end = getOnboardingCareerEndDate(birthDate);
  return !isDateBeforeDay(end, careerStart);
}
