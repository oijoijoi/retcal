import { useAppTheme } from '@/contexts/app-theme-context';
import {
  formatYearsLivedLabel,
  getFilledProgressSegments,
  getLifeProgressPercent,
  getYearsLived,
  LIFE_PROGRESS_SEGMENT_COUNT,
} from '@/lib/life-progress';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type LifeProgressBarProps = {
  birthDate: Date | null;
};

export function LifeProgressBar({ birthDate }: LifeProgressBarProps) {
  const { colors } = useAppTheme();

  const { label, percent, filledSegments } = useMemo(() => {
    if (!birthDate) {
      return {
        label: 'Прожито —',
        percent: 0,
        filledSegments: 0,
      };
    }

    const years = getYearsLived(birthDate);
    const progress = getLifeProgressPercent(birthDate);
    return {
      label: formatYearsLivedLabel(years),
      percent: progress,
      filledSegments: getFilledProgressSegments(progress),
    };
  }, [birthDate]);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.row}>
        <View style={styles.segments}>
          {Array.from({ length: LIFE_PROGRESS_SEGMENT_COUNT }).map((_, index) => {
            const filled = index < filledSegments;
            return (
              <View
                key={`segment-${index}`}
                style={[
                  styles.segment,
                  {
                    backgroundColor: filled ? colors.accent : colors.cellBase,
                  },
                ]}
              />
            );
          })}
        </View>
        <Text style={[styles.percent, { color: colors.textSecondary }]}>
          {percent}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    minWidth: 0,
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  segments: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
    minWidth: 0,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
  },
  percent: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 36,
    textAlign: 'right',
  },
});
