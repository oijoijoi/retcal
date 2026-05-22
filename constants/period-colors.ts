import type { ResolvedTheme } from '@/constants/app-theme';

/** В данных: 4 оттенка × 7 оттенков (красный … фиолетовый), row-major. */
export const PERIOD_COLOR_SHADES = 4;
export const PERIOD_COLOR_HUES = 7;

/** В пикере: 7 в ряд, 4 ряда (повёрнутая сетка). */
export const PERIOD_PICKER_COLS = PERIOD_COLOR_HUES;
export const PERIOD_PICKER_ROWS = PERIOD_COLOR_SHADES;

/** @deprecated Используйте PERIOD_COLOR_SHADES */
export const PERIOD_COLOR_COLS = PERIOD_COLOR_SHADES;
/** @deprecated Используйте PERIOD_COLOR_HUES */
export const PERIOD_COLOR_ROWS = PERIOD_COLOR_HUES;

/** Базовые цвета сетки: непрожитые / прожитые недели. */
export const LIGHT_GRID_BASE_COLORS = {
  unlived: '#DFE3DA',
  lived: '#98A091',
} as const;

export const DARK_GRID_BASE_COLORS = {
  unlived: '#232833',
  lived: '#62687A',
} as const;

/** Палитра периодов для светлой темы (7×4). */
export const LIGHT_PERIOD_COLOR_GRID: readonly string[] = [
  '#B73A48', '#E0656E', '#F49AA1', '#FED0D3',
  '#C45D22', '#F08A4B', '#F7B67D', '#FFE1BF',
  '#C49A1A', '#E8C23F', '#F6DC7F', '#FFF0BF',
  '#38895E', '#5EB67F', '#8DD9A6', '#C7EFD6',
  '#3B8FA1', '#60B6C6', '#95D6E2', '#CBEEF4',
  '#3D5FA3', '#5F87C7', '#93B6E6', '#CCEDFA',
  '#6B45A0', '#8D6CC6', '#B7A1E2', '#E2D8F7',
] as const;

/** Палитра периодов для тёмной темы (7×4). */
export const DARK_PERIOD_COLOR_GRID: readonly string[] = [
  '#8B2E3B', '#D14F5A', '#F2858D', '#FFB3B8',
  '#9A4B1F', '#E07A3F', '#F7B56B', '#FFD5A6',
  '#A88712', '#E3B62F', '#F6D66D', '#FFE9A6',
  '#2E6B4E', '#51A06E', '#7BCB97', '#B7E7C7',
  '#2D6F7F', '#4EA3B5', '#7ECAD9', '#B8E6EF',
  '#2B4D7E', '#4779B8', '#7FA8E0', '#B7CDF4',
  '#4A2E6E', '#7B5AA8', '#A68BD6', '#D7C6F0',
] as const;

export function getPeriodColorGrid(theme: ResolvedTheme): readonly string[] {
  return theme === 'dark' ? DARK_PERIOD_COLOR_GRID : LIGHT_PERIOD_COLOR_GRID;
}

export function getDefaultPeriodColor(theme: ResolvedTheme): string {
  return getPeriodColorGrid(theme)[0];
}

export function resolvePeriodColorPair(
  selectedHex: string,
  theme: ResolvedTheme
): { light: string; dark: string } {
  const themedIndex = getPeriodColorGrid(theme).indexOf(selectedHex);
  if (themedIndex >= 0) {
    return {
      light: LIGHT_PERIOD_COLOR_GRID[themedIndex],
      dark: DARK_PERIOD_COLOR_GRID[themedIndex],
    };
  }

  const lightIndex = LIGHT_PERIOD_COLOR_GRID.indexOf(selectedHex);
  if (lightIndex >= 0) {
    return {
      light: LIGHT_PERIOD_COLOR_GRID[lightIndex],
      dark: DARK_PERIOD_COLOR_GRID[lightIndex],
    };
  }

  const darkIndex = DARK_PERIOD_COLOR_GRID.indexOf(selectedHex);
  if (darkIndex >= 0) {
    return {
      light: LIGHT_PERIOD_COLOR_GRID[darkIndex],
      dark: DARK_PERIOD_COLOR_GRID[darkIndex],
    };
  }

  return { light: selectedHex, dark: selectedHex };
}
