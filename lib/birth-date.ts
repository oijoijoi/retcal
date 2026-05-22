import AsyncStorage from '@react-native-async-storage/async-storage';

const BIRTH_DATE_STORAGE_KEY = 'birthDateIso';
const STORAGE_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function startOfCalendarDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isDateBeforeDay(date: Date, minDate: Date): boolean {
  return startOfCalendarDay(date).getTime() < startOfCalendarDay(minDate).getTime();
}

export function parseBirthDateInput(input: string): Date | null {
  const normalized = input.trim();

  const datePattern = /^(\d{2})\.(\d{2})\.(\d{4})$/;
  const match = normalized.match(datePattern);
  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatMaskedDateInput(text: string): string {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  if (digits.length <= 2) {
    return day;
  }
  if (digits.length <= 4) {
    return `${day}.${month}`;
  }
  return `${day}.${month}.${year}`;
}

export function formatBirthDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}

export async function saveBirthDate(date: Date): Promise<void> {
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const storageDate = `${yyyy}-${mm}-${dd}`;
  await AsyncStorage.setItem(BIRTH_DATE_STORAGE_KEY, storageDate);
}

export async function loadBirthDate(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(BIRTH_DATE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  // Preferred format: YYYY-MM-DD (date-only, no timezone issues).
  const ymdMatch = raw.match(STORAGE_DATE_PATTERN);
  if (ymdMatch) {
    const year = Number(ymdMatch[1]);
    const month = Number(ymdMatch[2]);
    const day = Number(ymdMatch[3]);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }
    return date;
  }

  // Legacy compatibility disabled for now (old ISO values are ignored).
  // const legacyDate = new Date(raw);
  // if (Number.isNaN(legacyDate.getTime())) {
  //   return null;
  // }
  // return legacyDate;
  return null;
}

export async function clearBirthDate(): Promise<void> {
  await AsyncStorage.removeItem(BIRTH_DATE_STORAGE_KEY);
}
