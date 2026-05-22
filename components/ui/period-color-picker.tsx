import {
  DARK_PERIOD_COLOR_GRID,
  getDefaultPeriodColor,
  getPeriodColorGrid,
  LIGHT_PERIOD_COLOR_GRID,
  PERIOD_COLOR_HUES,
  PERIOD_COLOR_SHADES,
  PERIOD_PICKER_COLS,
  PERIOD_PICKER_ROWS,
} from '@/constants/period-colors';
import { useAppTheme } from '@/contexts/app-theme-context';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

type PeriodColorPickerProps = {
  value: string;
  onChange: (color: string) => void;
};

const GRID_GAP = 6;
const HORIZONTAL_PADDING = 40;
const SELECTED_BORDER_WIDTH = 3;
const DEFAULT_BORDER_WIDTH = 1;

export function PeriodColorPicker({ value, onChange }: PeriodColorPickerProps) {
  const { colors, resolved } = useAppTheme();
  const palette = useMemo(() => getPeriodColorGrid(resolved), [resolved]);

  const swatchSize = useMemo(() => {
    const screenWidth = Dimensions.get('window').width;
    const available =
      screenWidth - HORIZONTAL_PADDING - GRID_GAP * (PERIOD_PICKER_COLS - 1);
    return Math.floor(available / PERIOD_PICKER_COLS);
  }, []);

  /** 7 в ряд, 4 ряда: столбец = оттенок, строка = насыщенность. */
  const rows = useMemo(() => {
    const displayRows: string[][] = [];
    for (let shade = 0; shade < PERIOD_PICKER_ROWS; shade += 1) {
      const row: string[] = [];
      for (let hue = 0; hue < PERIOD_PICKER_COLS; hue += 1) {
        row.push(palette[hue * PERIOD_COLOR_SHADES + shade]);
      }
      displayRows.push(row);
    }
    return displayRows;
  }, [palette]);

  return (
    <View style={styles.grid}>
      {rows.map((rowColors, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {rowColors.map(color => {
            const selected = value === color;
            return (
              <Pressable
                key={color}
                onPress={() => onChange(color)}
                style={[
                  styles.swatch,
                  {
                    width: swatchSize,
                    height: swatchSize,
                    backgroundColor: color,
                    borderColor: selected ? colors.accent : colors.border,
                    borderWidth: selected
                      ? SELECTED_BORDER_WIDTH
                      : DEFAULT_BORDER_WIDTH,
                  },
                  selected ? styles.swatchSelected : null,
                ]}
              >
                {selected ? (
                  <Ionicons
                    name="checkmark"
                    size={Math.max(12, swatchSize * 0.4)}
                    color={isLightSwatch(color) ? '#1A1D22' : '#FFFFFF'}
                  />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export function useDefaultPeriodColor(): string {
  const { resolved } = useAppTheme();
  return getDefaultPeriodColor(resolved);
}

function isLightSwatch(hex: string): boolean {
  const lightIndex = LIGHT_PERIOD_COLOR_GRID.indexOf(hex);
  if (lightIndex >= 0) {
    return lightIndex % PERIOD_COLOR_SHADES >= 2;
  }
  const darkIndex = DARK_PERIOD_COLOR_GRID.indexOf(hex);
  if (darkIndex >= 0) {
    return darkIndex % PERIOD_COLOR_SHADES >= 2;
  }
  return false;
}

const styles = StyleSheet.create({
  grid: {
    gap: GRID_GAP,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: GRID_GAP,
  },
  swatch: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    transform: [{ scale: 1.06 }],
  },
});
