import { DARK_THEME, LIGHT_THEME } from '@/constants/app-theme';

export interface CellPaletteItem {
  id: number;
  color: string;
  name: string;
}

export interface PeriodPallete {
  id: number;
  title: string;
  lightColors: string[];
  darkColors: string[];
}

export const PERIODS_PALLETE_STORAGE_KEY = 'periodsPallete';

/** 0 — непрожитое, 1 — прожитое без периода; пользовательские с 2. */
export const USER_PERIOD_PALETTE_START_ID = 2;

export const DEFAULT_PERIODS_PALLETE: PeriodPallete = {
  id: 1,
  title: 'default',
  lightColors: [LIGHT_THEME.cellBase, LIGHT_THEME.cellLived],
  darkColors: [DARK_THEME.cellBase, DARK_THEME.cellLived],
};
