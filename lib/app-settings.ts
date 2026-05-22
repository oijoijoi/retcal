import { getJson, remove, setJson } from '@/lib/device-storage';
import type { GridScalePreference, ThemePreference } from '@/constants/app-theme';

export type { GridScalePreference, ThemePreference };

const THEME_PREFERENCE_KEY = 'themePreference';
const GRID_SCALE_KEY = 'gridScalePreference';

export async function loadThemePreference(): Promise<ThemePreference> {
  const stored = await getJson<ThemePreference>(THEME_PREFERENCE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
}

export async function saveThemePreference(value: ThemePreference): Promise<void> {
  await setJson(THEME_PREFERENCE_KEY, value);
}

export async function loadGridScalePreference(): Promise<GridScalePreference> {
  const stored = await getJson<GridScalePreference>(GRID_SCALE_KEY);
  if (stored === 'weeks' || stored === 'months') {
    return stored;
  }
  return 'weeks';
}

export async function saveGridScalePreference(
  value: GridScalePreference
): Promise<void> {
  await setJson(GRID_SCALE_KEY, value);
}

export async function clearAppSettings(): Promise<void> {
  await Promise.all([
    remove(THEME_PREFERENCE_KEY),
    remove(GRID_SCALE_KEY),
  ]);
}
