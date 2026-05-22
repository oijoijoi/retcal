import type { ResolvedTheme } from '@/constants/app-theme';
import type { PeriodPallete } from '@/constants/models';
import {
  isDateBeforeDay,
  parseBirthDateInput,
  startOfCalendarDay,
} from '@/lib/birth-date';
import type { LifePeriod } from '@/lib/periods';
import { getYearsLived } from '@/lib/life-progress';

const DAY_MS = 24 * 60 * 60 * 1000;

export function getPeriodColor(
  palette: PeriodPallete,
  paletteId: number,
  resolved: ResolvedTheme
): string {
  const colors = resolved === 'dark' ? palette.darkColors : palette.lightColors;
  return colors[paletteId] ?? colors[1] ?? '#888';
}

export function formatPeriodAgeRange(
  birthDate: Date,
  startDateStr: string,
  endDateStr: string
): string {
  const start = parseBirthDateInput(startDateStr);
  const end = parseBirthDateInput(endDateStr);
  if (!start || !end || isDateBeforeDay(end, birthDate)) {
    return '';
  }

  const startAge = getYearsLived(birthDate, start);
  const endAge = getYearsLived(birthDate, end);
  const today = startOfCalendarDay(new Date());
  const endDay = startOfCalendarDay(end);

  if (endDay.getTime() >= today.getTime() - DAY_MS) {
    return `${startAge}+ лет`;
  }

  if (startAge === endAge) {
    return `${startAge} лет`;
  }

  return `${startAge} – ${endAge} лет`;
}

export function sortPeriodsForLegend(periods: LifePeriod[]): LifePeriod[] {
  return [...periods].sort((a, b) => {
    const aStart = parseBirthDateInput(a.startDate);
    const bStart = parseBirthDateInput(b.startDate);
    if (!aStart || !bStart) {
      return 0;
    }
    return aStart.getTime() - bStart.getTime();
  });
}
