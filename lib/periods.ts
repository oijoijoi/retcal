import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DEFAULT_PERIODS_PALLETE,
  PERIODS_PALLETE_STORAGE_KEY,
  PeriodPallete,
} from '@/constants/models';
import { getJson, remove, setJson } from '@/lib/device-storage';

const PERIODS_STORAGE_KEY = 'lifePeriods';
const DAY_MS = 24 * 60 * 60 * 1000;
let periodsPalleteMemory: PeriodPallete | null = null;

export interface LifePeriod {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  type: string;
  color: string;
  durationWeeks: number;
  durationMonths: number;
}

export function getPeriodDurations(
  start: Date,
  end: Date
): {
  durationWeeks: number;
  durationMonths: number;
} {
  const diffDays = Math.max(
    0,
    Math.ceil((end.getTime() - start.getTime()) / DAY_MS)
  );
  const durationWeeks = diffDays === 0 ? 0 : Math.ceil(diffDays / 7);

  const monthsDiff =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  const hasPartialMonth = end.getDate() > start.getDate();
  const durationMonths = Math.max(0, monthsDiff + (hasPartialMonth ? 1 : 0));

  return { durationWeeks, durationMonths };
}

export async function loadPeriods(): Promise<LifePeriod[]> {
  const raw = await AsyncStorage.getItem(PERIODS_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LifePeriod[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function savePeriod(period: LifePeriod): Promise<void> {
  const existing = await loadPeriods();
  const next = [period, ...existing];
  await AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(next));
}

export async function loadPeriodsPallete(): Promise<PeriodPallete | null> {
  if (periodsPalleteMemory) {
    return periodsPalleteMemory;
  }

  const stored = await getJson<PeriodPallete>(PERIODS_PALLETE_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  periodsPalleteMemory = stored;
  return stored;
}

export async function savePeriodsPallete(pallete: PeriodPallete): Promise<void> {
  periodsPalleteMemory = pallete;
  await setJson(PERIODS_PALLETE_STORAGE_KEY, pallete);
}

export async function ensurePeriodsPalleteInitialized(): Promise<PeriodPallete> {
  const existing = await loadPeriodsPallete();
  if (existing) {
    return existing;
  }

  await savePeriodsPallete(DEFAULT_PERIODS_PALLETE);
  return DEFAULT_PERIODS_PALLETE;
}

export async function clearPeriods(): Promise<void> {
  await AsyncStorage.removeItem(PERIODS_STORAGE_KEY);
  periodsPalleteMemory = null;
  await remove(PERIODS_PALLETE_STORAGE_KEY);
}
