export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';
export type GridScalePreference = 'weeks' | 'months';

export type AppThemeColors = {
  background: string;
  surface: string;
  cellBase: string;
  cellLived: string;
  accent: string;
  text: string;
  textSecondary: string;
  border: string;
  danger: string;
  dangerSurface: string;
  overlay: string;
  menuBackdrop: string;
};

export const LIGHT_THEME: AppThemeColors = {
  background: '#FAFAFB',
  surface: '#FFFFFF',
  cellBase: '#DFE3DA',
  cellLived: '#98A091',
  accent: '#2E7D64',
  text: '#111418',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  danger: '#B91C1C',
  dangerSurface: '#FEF2F2',
  overlay: 'rgba(17, 24, 39, 0.45)',
  menuBackdrop: 'rgba(17, 24, 39, 0.35)',
};

export const DARK_THEME: AppThemeColors = {
  background: '#0F1115',
  surface: '#161A20',
  cellBase: '#232833',
  cellLived: '#62687A',
  accent: '#7CC89A',
  text: '#E6E9EE',
  textSecondary: '#9AA3AE',
  border: '#2A2F37',
  danger: '#FCA5A5',
  dangerSurface: 'rgba(127, 29, 29, 0.35)',
  overlay: 'rgba(0, 0, 0, 0.55)',
  menuBackdrop: 'rgba(0, 0, 0, 0.5)',
};

export function getThemeColors(resolved: ResolvedTheme): AppThemeColors {
  return resolved === 'dark' ? DARK_THEME : LIGHT_THEME;
}
