import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  generateMonthsFromBirthDate,
  generateWeeksFromBirthDate,
  TOTAL_MONTHS,
  TOTAL_WEEKS,
} from '@/lib/weeks';

const WEEKS_ARRAY_STORAGE_KEY = 'weeksArray';
const MONTHES_ARRAY_STORAGE_KEY = 'monthesArray';

export interface GridArrays {
  weeksArray: Uint8Array;
  monthesArray: Uint8Array;
}

export function buildGridArraysFromBirthDate(birthDate: Date): GridArrays {
  return {
    weeksArray: generateWeeksFromBirthDate(birthDate),
    monthesArray: generateMonthsFromBirthDate(birthDate),
  };
}

export async function saveGridArraysFromBirthDate(birthDate: Date): Promise<void> {
  const { weeksArray, monthesArray } = buildGridArraysFromBirthDate(birthDate);

  await AsyncStorage.multiSet([
    [WEEKS_ARRAY_STORAGE_KEY, JSON.stringify(Array.from(weeksArray))],
    [MONTHES_ARRAY_STORAGE_KEY, JSON.stringify(Array.from(monthesArray))],
  ]);
}

export async function loadGridArrays(): Promise<GridArrays | null> {
  const pairs = await AsyncStorage.multiGet([
    WEEKS_ARRAY_STORAGE_KEY,
    MONTHES_ARRAY_STORAGE_KEY,
  ]);
  const weeksRaw = pairs[0]?.[1];
  const monthesRaw = pairs[1]?.[1];
  if (!weeksRaw || !monthesRaw) {
    return null;
  }

  try {
    const weeksParsed = JSON.parse(weeksRaw) as number[];
    const monthesParsed = JSON.parse(monthesRaw) as number[];

    if (!Array.isArray(weeksParsed) || !Array.isArray(monthesParsed)) {
      return null;
    }
    if (weeksParsed.length !== TOTAL_WEEKS || monthesParsed.length !== TOTAL_MONTHS) {
      return null;
    }

    return {
      weeksArray: Uint8Array.from(weeksParsed),
      monthesArray: Uint8Array.from(monthesParsed),
    };
  } catch {
    return null;
  }
}

export async function clearGridArrays(): Promise<void> {
  await AsyncStorage.multiRemove([
    WEEKS_ARRAY_STORAGE_KEY,
    MONTHES_ARRAY_STORAGE_KEY,
  ]);
}
