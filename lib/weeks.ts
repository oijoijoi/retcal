export const TOTAL_WEEKS = 4160;
export const TOTAL_MONTHS = 960;
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

export function generateWeeksFromBirthDate(birthDate: Date): Uint8Array {
  const weeks = new Uint8Array(TOTAL_WEEKS);
  const currentDate = new Date();
  const weeksPassedNow = getWeeksPassedByYearRule(birthDate, currentDate);

  for (let i = 0; i < TOTAL_WEEKS; i += 1) {
    const ageWeek = i + 1;
    const isPastWeek = weeksPassedNow > 0 && ageWeek <= weeksPassedNow;
    weeks[i] = isPastWeek ? 1 : 0;
  }

  return weeks;
}

export function generateMonthsFromBirthDate(birthDate: Date): Uint8Array {
  const months = new Uint8Array(TOTAL_MONTHS);
  const currentDate = new Date();

  for (let i = 0; i < TOTAL_MONTHS; i += 1) {
    const monthDate = new Date(birthDate);
    monthDate.setMonth(monthDate.getMonth() + i);
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      birthDate.getDate() - 1
    );

    const isPastMonth = monthEnd < currentDate;
    months[i] = isPastMonth ? 1 : 0;
  }

  return months;
}

export function getWeeksPassedFromBirthDate(birthDate: Date): number {
  const weeksPassed = getWeeksPassedByYearRule(birthDate, new Date());
  return Math.min(TOTAL_WEEKS, weeksPassed);
}
