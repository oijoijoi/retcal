export interface PeriodPallete {
  id: number;
  title: string;
  items: string[];
}

export const PERIODS_PALLETE_STORAGE_KEY = 'periodsPallete';

export const DEFAULT_PERIODS_PALLETE: PeriodPallete = {
  id: 1,
  title: 'default',
  items: ['#e5e7eb', '#6b7280'],
};
