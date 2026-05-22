import type { ResolvedTheme } from '@/constants/app-theme';
import { DARK_THEME, LIGHT_THEME } from '@/constants/app-theme';
import {
  CellPaletteItem,
  DEFAULT_PERIODS_PALLETE,
  PERIODS_PALLETE_STORAGE_KEY,
  PeriodPallete,
  USER_PERIOD_PALETTE_START_ID,
} from '@/constants/models';
import { isDateBeforeDay, loadBirthDate } from '@/lib/birth-date';
import { getJson, remove, setJson } from '@/lib/device-storage';
import { GridArrays, loadGridArrays, saveGridArrays } from '@/lib/grid-arrays';
import {
  getMonthIndexFromBirthDate,
  getWeekIndexFromBirthDate,
} from '@/lib/weeks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type { CellPaletteItem };

const PERIODS_STORAGE_KEY = 'lifePeriods';
const DAY_MS = 24 * 60 * 60 * 1000;
let periodsPalleteMemory: PeriodPallete | null = null;

export interface LifePeriod {
  id: string;
  paletteId: number;
  title: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  durationMonths: number;
}

export interface SavePeriodInput {
  title: string;
  startDate: string;
  endDate: string;
  lightColor: string;
  darkColor: string;
  durationWeeks: number;
  durationMonths: number;
}

type LegacyPeriodPallete = PeriodPallete & { items?: string[] };

function normalizePeriodPallete(raw: unknown): PeriodPallete {
  if (!raw || typeof raw !== 'object') {
    return { ...DEFAULT_PERIODS_PALLETE };
  }

  const stored = raw as LegacyPeriodPallete;

  if (Array.isArray(stored.lightColors) && Array.isArray(stored.darkColors)) {
    return {
      id: stored.id ?? DEFAULT_PERIODS_PALLETE.id,
      title: stored.title ?? DEFAULT_PERIODS_PALLETE.title,
      lightColors: [...stored.lightColors],
      darkColors: [...stored.darkColors],
    };
  }

  if (Array.isArray(stored.items) && stored.items.length > 0) {
    const lightColors = [
      LIGHT_THEME.cellBase,
      LIGHT_THEME.cellLived,
      ...stored.items.slice(2),
    ];
    const darkColors = [
      DARK_THEME.cellBase,
      DARK_THEME.cellLived,
      ...stored.items.slice(2),
    ];
    if (stored.items.length >= 2) {
      lightColors[0] = stored.items[0];
      lightColors[1] = stored.items[1];
      darkColors[0] = stored.items[0];
      darkColors[1] = stored.items[1];
    }
    return {
      id: stored.id ?? DEFAULT_PERIODS_PALLETE.id,
      title: stored.title ?? DEFAULT_PERIODS_PALLETE.title,
      lightColors,
      darkColors,
    };
  }

  return { ...DEFAULT_PERIODS_PALLETE };
}

function isLegacyPeriodPallete(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') {
    return false;
  }
  const stored = raw as LegacyPeriodPallete;
  return Boolean(stored.items) && !stored.lightColors;
}

function getNextPaletteId(
  palette: PeriodPallete,
  periods: LifePeriod[]
): number {
  const maxFromPeriods = periods.reduce(
    (max, period) => Math.max(max, period.paletteId ?? 0),
    USER_PERIOD_PALETTE_START_ID - 1
  );
  return Math.max(
    USER_PERIOD_PALETTE_START_ID,
    palette.lightColors.length,
    palette.darkColors.length,
    maxFromPeriods + 1
  );
}

function extendPaletteColors(
  colors: string[],
  paletteId: number,
  fallback: string
): string[] {
  const next = [...colors];
  while (next.length <= paletteId) {
    next.push(next[next.length - 1] ?? fallback);
  }
  return next;
}

function clearPaletteIdInRange(
  arrays: GridArrays,
  birthDate: Date,
  startDate: Date,
  endDate: Date,
  paletteId: number
): void {
  const startWeek = getWeekIndexFromBirthDate(birthDate, startDate);
  const endWeek = getWeekIndexFromBirthDate(birthDate, endDate);
  for (let i = startWeek; i <= endWeek; i += 1) {
    if (arrays.weeksArray[i] === paletteId) {
      arrays.weeksArray[i] = 1;
    }
  }

  const startMonth = getMonthIndexFromBirthDate(birthDate, startDate);
  const endMonth = getMonthIndexFromBirthDate(birthDate, endDate);
  for (let i = startMonth; i <= endMonth; i += 1) {
    if (arrays.monthesArray[i] === paletteId) {
      arrays.monthesArray[i] = 1;
    }
  }
}

function applyPeriodToGridArrays(
  arrays: GridArrays,
  birthDate: Date,
  startDate: Date,
  endDate: Date,
  paletteId: number
): void {
  const startWeek = getWeekIndexFromBirthDate(birthDate, startDate);
  const endWeek = getWeekIndexFromBirthDate(birthDate, endDate);
  for (let i = startWeek; i <= endWeek; i += 1) {
    arrays.weeksArray[i] = paletteId;
  }

  const startMonth = getMonthIndexFromBirthDate(birthDate, startDate);
  const endMonth = getMonthIndexFromBirthDate(birthDate, endDate);
  for (let i = startMonth; i <= endMonth; i += 1) {
    arrays.monthesArray[i] = paletteId;
  }
}

export function buildCellPalette(
  palette: PeriodPallete,
  resolved: ResolvedTheme
): CellPaletteItem[] {
  const colors = resolved === 'dark' ? palette.darkColors : palette.lightColors;
  return colors.map((color, id) => ({
    id,
    color,
    name: `state-${id}`,
  }));
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
    const parsed = JSON.parse(raw) as (LifePeriod & {
      type?: string;
      color?: string;
    })[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed.map((period, index) => ({
      id: period.id ?? `${Date.now()}-${index}`,
      paletteId:
        period.paletteId ??
        (index + USER_PERIOD_PALETTE_START_ID),
      title: period.title,
      startDate: period.startDate,
      endDate: period.endDate,
      durationWeeks: period.durationWeeks,
      durationMonths: period.durationMonths,
    }));
  } catch {
    return [];
  }
}

export async function savePeriod(input: SavePeriodInput): Promise<LifePeriod> {
  const birthDate = await loadBirthDate();
  if (!birthDate) {
    throw new Error('Birth date is required to save a period');
  }

  const gridArrays = await loadGridArrays();
  if (!gridArrays) {
    throw new Error('Grid arrays are required to save a period');
  }

  const start = parsePeriodDate(input.startDate);
  const end = parsePeriodDate(input.endDate);
  if (!start || !end) {
    throw new Error('Invalid period dates');
  }
  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }
  if (isDateBeforeDay(start, birthDate) || isDateBeforeDay(end, birthDate)) {
    throw new Error('Period dates cannot be before birth date');
  }

  const palette = await ensurePeriodsPalleteInitialized();
  const existingPeriods = await loadPeriods();
  const paletteId = getNextPaletteId(palette, existingPeriods);

  const weeksArray = new Uint8Array(gridArrays.weeksArray);
  const monthesArray = new Uint8Array(gridArrays.monthesArray);
  applyPeriodToGridArrays(
    { weeksArray, monthesArray },
    birthDate,
    start,
    end,
    paletteId
  );

  const nextPalette: PeriodPallete = {
    ...palette,
    lightColors: extendPaletteColors(
      palette.lightColors,
      paletteId,
      LIGHT_THEME.cellLived
    ),
    darkColors: extendPaletteColors(
      palette.darkColors,
      paletteId,
      DARK_THEME.cellLived
    ),
  };
  nextPalette.lightColors[paletteId] = input.lightColor;
  nextPalette.darkColors[paletteId] = input.darkColor;

  const period: LifePeriod = {
    id: Date.now().toString(),
    paletteId,
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    durationWeeks: input.durationWeeks,
    durationMonths: input.durationMonths,
  };

  await Promise.all([
    AsyncStorage.setItem(
      PERIODS_STORAGE_KEY,
      JSON.stringify([period, ...existingPeriods])
    ),
    savePeriodsPallete(nextPalette),
    saveGridArrays({ weeksArray, monthesArray }),
  ]);

  return period;
}

export async function getPeriodById(id: string): Promise<LifePeriod | null> {
  const periods = await loadPeriods();
  return periods.find(period => period.id === id) ?? null;
}

export async function updatePeriod(
  id: string,
  input: SavePeriodInput
): Promise<LifePeriod> {
  const birthDate = await loadBirthDate();
  if (!birthDate) {
    throw new Error('Birth date is required to update a period');
  }

  const gridArrays = await loadGridArrays();
  if (!gridArrays) {
    throw new Error('Grid arrays are required to update a period');
  }

  const existingPeriods = await loadPeriods();
  const existingIndex = existingPeriods.findIndex(period => period.id === id);
  if (existingIndex < 0) {
    throw new Error('Period not found');
  }

  const existing = existingPeriods[existingIndex];
  const oldStart = parsePeriodDate(existing.startDate);
  const oldEnd = parsePeriodDate(existing.endDate);
  const start = parsePeriodDate(input.startDate);
  const end = parsePeriodDate(input.endDate);

  if (!oldStart || !oldEnd || !start || !end) {
    throw new Error('Invalid period dates');
  }
  if (start > end) {
    throw new Error('Start date cannot be after end date');
  }
  if (isDateBeforeDay(start, birthDate) || isDateBeforeDay(end, birthDate)) {
    throw new Error('Period dates cannot be before birth date');
  }

  const palette = await ensurePeriodsPalleteInitialized();
  const weeksArray = new Uint8Array(gridArrays.weeksArray);
  const monthesArray = new Uint8Array(gridArrays.monthesArray);

  clearPaletteIdInRange(
    { weeksArray, monthesArray },
    birthDate,
    oldStart,
    oldEnd,
    existing.paletteId
  );
  applyPeriodToGridArrays(
    { weeksArray, monthesArray },
    birthDate,
    start,
    end,
    existing.paletteId
  );

  const nextPalette: PeriodPallete = {
    ...palette,
    lightColors: [...palette.lightColors],
    darkColors: [...palette.darkColors],
  };
  nextPalette.lightColors[existing.paletteId] = input.lightColor;
  nextPalette.darkColors[existing.paletteId] = input.darkColor;

  const updated: LifePeriod = {
    ...existing,
    title: input.title,
    startDate: input.startDate,
    endDate: input.endDate,
    durationWeeks: input.durationWeeks,
    durationMonths: input.durationMonths,
  };

  const nextPeriods = [...existingPeriods];
  nextPeriods[existingIndex] = updated;

  await Promise.all([
    AsyncStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(nextPeriods)),
    savePeriodsPallete(nextPalette),
    saveGridArrays({ weeksArray, monthesArray }),
  ]);

  return updated;
}

function parsePeriodDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
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

export async function loadPeriodsPallete(): Promise<PeriodPallete | null> {
  if (periodsPalleteMemory) {
    return periodsPalleteMemory;
  }

  const stored = await getJson<unknown>(PERIODS_PALLETE_STORAGE_KEY);
  if (!stored) {
    return null;
  }

  const normalized = normalizePeriodPallete(stored);
  if (isLegacyPeriodPallete(stored)) {
    await setJson(PERIODS_PALLETE_STORAGE_KEY, normalized);
  }

  periodsPalleteMemory = normalized;
  return normalized;
}

export async function savePeriodsPallete(
  pallete: PeriodPallete
): Promise<void> {
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
