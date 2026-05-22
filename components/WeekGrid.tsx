import { Canvas, RoundedRect } from '@shopify/react-native-skia';
import Constants from 'expo-constants';
import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type { CellPaletteItem } from '@/constants/models';

export type { CellPaletteItem };

interface WeekGridProps {
  cellData: Uint8Array;
  palette: CellPaletteItem[];
  columns?: number;
  markerEveryRows?: number;
  splitAfter?: number;
  splitGap?: number;
  markerStep?: number;
  markerSuffix?: string;
  backgroundColor?: string;
  markerTextColor?: string;
  markerTickColor?: string;
}

const CELL_GAP = 2;
const CONTAINER_PADDING = 8;
const YEAR_COLUMN_WIDTH = 20;
const TICK_GAP_TO_GRID = 2;
const CELL_RADIUS = 2;

export function WeekGrid({
  cellData,
  palette,
  columns = 26,
  markerEveryRows = 2,
  splitAfter,
  splitGap = CELL_GAP,
  markerStep = 1,
  markerSuffix = '',
  backgroundColor = 'white',
  markerTextColor = '#6b7280',
  markerTickColor = '#9ca3af',
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

  const rowCount = useMemo(
    () => Math.ceil(cellData.length / columns),
    [cellData.length, columns]
  );

  const splitSpacerWidth = Math.max(0, splitGap - CELL_GAP);
  const rowHeight = cellSize + CELL_GAP;
  const markerHeight = columns === 52 ? cellSize * 2 + CELL_GAP : cellSize;
  const gridOffsetX = YEAR_COLUMN_WIDTH;
  const canvasWidth = useMemo(() => {
    if (containerWidth <= 0) {
      return 0;
    }

    return Math.max(0, containerWidth - CONTAINER_PADDING * 2);
  }, [containerWidth]);
  const canvasHeight = useMemo(
    () => rowCount * rowHeight,
    [rowCount, rowHeight]
  );

  const paletteById = useMemo(() => {
    const byId = new Map<number, CellPaletteItem>();
    for (const item of palette) {
      byId.set(item.id, item);
    }
    return byId;
  }, [palette]);

  const cells = useMemo(
    () =>
      Array.from(cellData, (value, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const splitOffset =
          splitAfter && splitAfter > 0
            ? Math.floor(column / splitAfter) * splitSpacerWidth
            : 0;
        const x = gridOffsetX + column * (cellSize + CELL_GAP) + splitOffset;
        const y = row * rowHeight;
        const color = paletteById.get(value)?.color ?? '#e5e7eb';
        return (
          <RoundedRect
            key={`cell-${index}`}
            x={x}
            y={y}
            width={cellSize}
            height={cellSize}
            color={color}
            r={CELL_RADIUS}
          />
        );
      }),
    [
      cellData,
      columns,
      paletteById,
      rowHeight,
      splitAfter,
      splitSpacerWidth,
      cellSize,
      gridOffsetX,
    ]
  );

  const markers = useMemo(
    () =>
      Array.from({ length: rowCount }).map((_, rowIndex) => {
        if (rowIndex % markerEveryRows !== markerEveryRows - 1) {
          return null;
        }

        return (
          <View
            key={`marker-${rowIndex}`}
            style={[
              styles.yearMarker,
              {
                top:
                  columns === 52
                    ? Math.max(0, (rowIndex - 1) * rowHeight)
                    : rowIndex * rowHeight,
                height: markerHeight,
              },
            ]}
          >
            <Text style={[styles.yearLabel, { color: markerTextColor }]}>
              {(Math.floor(rowIndex / markerEveryRows) + 1) * markerStep}
              {markerSuffix}
            </Text>
            <View
              style={[styles.yearTick, { backgroundColor: markerTickColor }]}
            />
          </View>
        );
      }),
    [
      columns,
      markerEveryRows,
      markerStep,
      markerSuffix,
      rowCount,
      rowHeight,
      markerHeight,
      markerTextColor,
      markerTickColor,
    ]
  );

  const fallbackCells = useMemo(
    () =>
      Array.from(cellData, (value, index) => {
        const row = Math.floor(index / columns);
        const column = index % columns;
        const splitOffset =
          splitAfter && splitAfter > 0
            ? Math.floor(column / splitAfter) * splitSpacerWidth
            : 0;
        const x = gridOffsetX + column * (cellSize + CELL_GAP) + splitOffset;
        const y = row * rowHeight;
        const color = paletteById.get(value)?.color ?? '#e5e7eb';

        return (
          <View
            key={`fallback-cell-${index}`}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: cellSize,
              height: cellSize,
              backgroundColor: color,
              borderRadius: CELL_RADIUS,
            }}
          />
        );
      }),
    [
      cellData,
      columns,
      splitAfter,
      splitSpacerWidth,
      gridOffsetX,
      cellSize,
      rowHeight,
      paletteById,
    ]
  );

  const shouldUseSkia =
    Platform.OS !== 'web' && Constants.appOwnership !== 'expo';

  return (
    <View
      style={[styles.container, { backgroundColor }]}
      onLayout={onContainerLayout}
    >
      <ScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={styles.contentContainer}
      >
        <View style={{ width: canvasWidth, height: canvasHeight }}>
          {!shouldUseSkia ? (
            <View style={StyleSheet.absoluteFillObject}>{fallbackCells}</View>
          ) : (
            <Canvas style={StyleSheet.absoluteFillObject}>{cells}</Canvas>
          )}
          {markers}
        </View>
      </ScrollView>
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
  yearMarker: {
    position: 'absolute',
    width: YEAR_COLUMN_WIDTH,
    justifyContent: 'center',
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
