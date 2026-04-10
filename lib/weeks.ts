export interface WeekData {
  weekNumber: number;
  year: number;
  ageWeek: number;
  date: Date;
  isCurrentWeek: boolean;
  isPastWeek: boolean;
  hasPeriod: boolean;
  periodColor?: string;
  periodTitle?: string;
}

export interface MonthData {
  monthNumber: number;
  year: number;
  ageMonth: number;
  date: Date;
  isCurrentMonth: boolean;
  isPastMonth: boolean;
  hasPeriod: boolean;
  periodColor?: string;
  periodTitle?: string;
}

export const DEFAULT_BIRTH_DATE = new Date(1990, 0, 1);
export const TOTAL_WEEKS = 5200;
export const TOTAL_MONTHS = 1200;
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getWeeksPassedByYearRule(
  birthDate: Date,
  targetDate: Date
): number {
  const start = startOfDay(birthDate);
  const end = startOfDay(targetDate);

  if (end < start) {
    return 0;
  }

  let fullYears = end.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + fullYears);

  if (anniversary > end) {
    fullYears -= 1;
    anniversary.setFullYear(start.getFullYear() + fullYears);
  }

  const remainderDays = Math.max(
    0,
    Math.floor((end.getTime() - anniversary.getTime()) / DAY_MS)
  );
  const remainderWeeks = remainderDays === 0 ? 0 : Math.ceil(remainderDays / 7);

  return fullYears * 52 + remainderWeeks;
}

export function generateWeeksFromBirthDate(birthDate: Date): WeekData[] {
  const weeks: WeekData[] = [];
  const currentDate = new Date();
  const weeksPassedNow = getWeeksPassedByYearRule(birthDate, currentDate);

  for (let i = 0; i < TOTAL_WEEKS; i += 1) {
    const currentWeekDate = new Date(birthDate);
    currentWeekDate.setDate(currentWeekDate.getDate() + i * 7);
    const ageWeek = i + 1;
    const isCurrentWeek = weeksPassedNow > 0 && ageWeek === weeksPassedNow;
    const isPastWeek = weeksPassedNow > 0 && ageWeek <= weeksPassedNow;

    weeks.push({
      weekNumber: (i % 52) + 1,
      year: currentWeekDate.getFullYear(),
      ageWeek,
      date: new Date(currentWeekDate),
      isCurrentWeek,
      isPastWeek,
      hasPeriod: false,
    });
  }

  return weeks;
}

export function generateMonthsFromBirthDate(birthDate: Date): MonthData[] {
  const months: MonthData[] = [];
  const currentDate = new Date();

  for (let i = 0; i < TOTAL_MONTHS; i += 1) {
    const monthDate = new Date(birthDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    const monthStart = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth(),
      birthDate.getDate()
    );
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      birthDate.getDate() - 1
    );

    months.push({
      monthNumber: (i % 12) + 1,
      year: monthDate.getFullYear(),
      ageMonth: i + 1,
      date: monthStart,
      isCurrentMonth: currentDate >= monthStart && currentDate <= monthEnd,
      isPastMonth: monthEnd < currentDate,
      hasPeriod: false,
    });
  }

  return months;
}

export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export function getWeeksInYear(year: number): number {
  const lastDayOfYear = new Date(year, 11, 31);
  return getWeekNumber(lastDayOfYear);
}

export function getWeeksPassedFromBirthDate(birthDate: Date): number {
  const weeksPassed = getWeeksPassedByYearRule(birthDate, new Date());
  return Math.min(TOTAL_WEEKS, weeksPassed);
}

export function generateDefaultWeeks(): WeekData[] {
  return generateWeeksFromBirthDate(DEFAULT_BIRTH_DATE);
}
