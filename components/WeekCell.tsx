import { WeekData } from '@/lib/weeks';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface WeekCellProps {
  week: WeekData;
  size?: number;
  gap?: number;
}

function WeekCellComponent({
  week,
  size = 12,
  gap = 2,
}: WeekCellProps) {
  return (
    <View
      style={[
        styles.cell,
        { width: size, height: size, margin: gap / 2 },
        week.isPastWeek ? styles.pastWeek : styles.futureWeek,
        week.isCurrentWeek && styles.currentWeek,
        week.hasPeriod && { borderWidth: 0, backgroundColor: week.periodColor ?? '#3b82f6' },
      ]}
    >
      <View style={styles.inner} />
    </View>
  );
}

export const WeekCell = React.memo(WeekCellComponent);

const styles = StyleSheet.create({
  cell: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  futureWeek: {
    backgroundColor: '#e5e7eb',
  },
  pastWeek: {
    backgroundColor: '#6b7280',
    borderColor: '#6b7280',
  },
  currentWeek: {
    borderColor: '#3b82f6',
    borderWidth: 2,
  },
  inner: {
    width: '100%',
    height: '100%',
  },
});