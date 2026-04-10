import { WeekData } from '@/lib/weeks';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  LayoutChangeEvent,
  ListRenderItem,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { WeekCell } from './WeekCell';

interface WeekGridProps {
  weeks: WeekData[];
  columns?: number;
  markerEveryRows?: number;
  splitAfter?: number;
  splitGap?: number;
  markerStep?: number;
  markerSuffix?: string;
}

const CELL_GAP = 2;
const CONTAINER_PADDING = 8;
const YEAR_COLUMN_WIDTH = 20;
const TICK_GAP_TO_GRID = 2;

export function WeekGrid({
  weeks,
  columns = 26,
  markerEveryRows = 2,
  splitAfter,
  splitGap = CELL_GAP,
  markerStep = 1,
  markerSuffix = '',
}: WeekGridProps) {
  const [containerWidth, setContainerWidth] = useState(0);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    setContainerWidth(event.nativeEvent.layout.width);
  };

  const cellSize = useMemo(() => {
    if (containerWidth <= 0) {
      return 10;
    }

    const horizontalPadding = CONTAINER_PADDING * 2;
    const timelineWidth = YEAR_COLUMN_WIDTH;
    const totalGaps = columns * CELL_GAP;
    const extraSplitCount =
      splitAfter && splitAfter > 0 ? Math.floor((columns - 1) / splitAfter) : 0;
    const extraSplitWidth = extraSplitCount * Math.max(0, splitGap - CELL_GAP);
    const available =
      containerWidth -
      horizontalPadding -
      timelineWidth -
      totalGaps -
      extraSplitWidth;
    return Math.max(4, available / columns);
  }, [columns, containerWidth, splitAfter, splitGap]);

  const weekRows = useMemo(() => {
    const rows: WeekData[][] = [];
    for (let i = 0; i < weeks.length; i += columns) {
      rows.push(weeks.slice(i, i + columns));
    }
    return rows;
  }, [columns, weeks]);

  const splitSpacerWidth = Math.max(0, splitGap - CELL_GAP);

  const renderRow: ListRenderItem<WeekData[]> = ({ item: row, index: rowIndex }) => (
    <View style={styles.row}>
      <View style={styles.yearColumn}>
        {rowIndex % markerEveryRows === markerEveryRows - 1 ? (
          <View style={styles.yearMarker}>
            <Text style={styles.yearLabel}>
              {(Math.floor(rowIndex / markerEveryRows) + 1) * markerStep}
              {markerSuffix}
            </Text>
            <View style={styles.yearTick} />
          </View>
        ) : null}
      </View>

      <View style={styles.weeksRow}>
        {row.map((week, index) => (
          <React.Fragment
            key={`${week.year}-${week.weekNumber}-${week.date.getTime()}`}
          >
            <WeekCell
              week={week}
              size={cellSize}
              gap={CELL_GAP}
            />
            {splitAfter &&
            splitAfter > 0 &&
            (index + 1) % splitAfter === 0 &&
            index < row.length - 1 ? (
              <View style={{ width: splitSpacerWidth }} />
            ) : null}
          </React.Fragment>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container} onLayout={onContainerLayout}>
      <FlatList
        data={weekRows}
        renderItem={renderRow}
        keyExtractor={(_, index) => `row-${index}`}
        showsVerticalScrollIndicator
        contentContainerStyle={styles.contentContainer}
        initialNumToRender={18}
        maxToRenderPerBatch={24}
        windowSize={12}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  contentContainer: {
    padding: CONTAINER_PADDING,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearColumn: {
    width: YEAR_COLUMN_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearMarker: {
    width: '100%',
    alignItems: 'flex-end',
  },
  yearLabel: {
    fontSize: 10,
    color: '#6b7280',
    marginBottom: 1,
    marginRight: TICK_GAP_TO_GRID,
  },
  yearTick: {
    width: 12,
    height: 1,
    backgroundColor: '#9ca3af',
    marginRight: TICK_GAP_TO_GRID,
  },
  weeksRow: {
    flexDirection: 'row',
  },
});
