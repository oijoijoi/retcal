const DEFAULT_LIFE_EXPECTANCY_YEARS = 80;
const PROGRESS_SEGMENTS = 6;

export function getYearsLived(birthDate: Date, targetDate: Date = new Date()): number {
  const start = new Date(
    birthDate.getFullYear(),
    birthDate.getMonth(),
    birthDate.getDate()
  );
  const end = new Date(
    targetDate.getFullYear(),
    targetDate.getMonth(),
    targetDate.getDate()
  );

  if (end < start) {
    return 0;
  }

  let years = end.getFullYear() - start.getFullYear();
  const anniversary = new Date(start);
  anniversary.setFullYear(start.getFullYear() + years);

  if (anniversary > end) {
    years -= 1;
  }

  return Math.max(0, years);
}

export function getLifeProgressPercent(
  birthDate: Date,
  lifeExpectancyYears = DEFAULT_LIFE_EXPECTANCY_YEARS
): number {
  const years = getYearsLived(birthDate);
  if (lifeExpectancyYears <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((years / lifeExpectancyYears) * 100));
}

export function getFilledProgressSegments(
  percent: number,
  totalSegments = PROGRESS_SEGMENTS
): number {
  const clamped = Math.max(0, Math.min(100, percent));
  return Math.min(
    totalSegments,
    Math.max(0, Math.ceil((clamped / 100) * totalSegments))
  );
}

export function formatYearsLivedLabel(years: number): string {
  return `Прожито ${years} ${pluralizeYears(years)}`;
}

function pluralizeYears(value: number): string {
  const mod10 = value % 10;
  const mod100 = value % 100;

  if (mod100 >= 11 && mod100 <= 14) {
    return 'лет';
  }
  if (mod10 === 1) {
    return 'год';
  }
  if (mod10 >= 2 && mod10 <= 4) {
    return 'года';
  }
  return 'лет';
}

export const LIFE_PROGRESS_SEGMENT_COUNT = PROGRESS_SEGMENTS;
