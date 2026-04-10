import AsyncStorage from '@react-native-async-storage/async-storage';

const BIRTH_DATE_STORAGE_KEY = 'birthDateIso';

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

export function formatBirthDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear());
  return `${day}.${month}.${year}`;
}

export async function saveBirthDate(date: Date): Promise<void> {
  await AsyncStorage.setItem(BIRTH_DATE_STORAGE_KEY, date.toISOString());
}

export async function loadBirthDate(): Promise<Date | null> {
  const raw = await AsyncStorage.getItem(BIRTH_DATE_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export async function clearBirthDate(): Promise<void> {
  await AsyncStorage.removeItem(BIRTH_DATE_STORAGE_KEY);
}
