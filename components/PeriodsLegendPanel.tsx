import type { PeriodPallete } from '@/constants/models';
import { useAppTheme } from '@/contexts/app-theme-context';
import {
  formatPeriodAgeRange,
  getPeriodColor,
  sortPeriodsForLegend,
} from '@/lib/period-display';
import type { LifePeriod } from '@/lib/periods';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type PeriodsLegendPanelProps = {
  periods: LifePeriod[];
  palette: PeriodPallete;
  birthDate: Date | null;
  onPeriodPress: (periodId: string) => void;
  onAddPress: () => void;
};

export function PeriodsLegendPanel({
  periods,
  palette,
  birthDate,
  onPeriodPress,
  onAddPress,
}: PeriodsLegendPanelProps) {
  const insets = useSafeAreaInsets();
  const { colors, resolved } = useAppTheme();
  const [expanded, setExpanded] = useState(false);

  const sortedPeriods = useMemo(
    () => sortPeriodsForLegend(periods),
    [periods]
  );

  const glassBackground =
    resolved === 'dark' ? 'rgba(22, 26, 32, 0.94)' : 'rgba(255, 255, 255, 0.92)';

  if (!expanded) {
    return (
      <View
        style={[styles.collapsedWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => setExpanded(true)}
          style={[
            styles.collapsedBar,
            {
              backgroundColor: glassBackground,
              borderColor: colors.border,
            },
          ]}
        >
          <Text style={[styles.collapsedLabel, { color: colors.accent }]}>
            Периоды (легенда)
          </Text>
          <Ionicons name="chevron-down" size={18} color={colors.accent} />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.expandedRoot} pointerEvents="box-none">
      <Pressable
        style={styles.backdrop}
        onPress={() => setExpanded(false)}
      />
      <View
        style={[
          styles.sheet,
          {
            backgroundColor: glassBackground,
            borderColor: colors.border,
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
      >
        <View style={styles.handleWrap}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.sheetHeader}>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>
            Периоды (легенда)
          </Text>
          <Pressable
            onPress={() => setExpanded(false)}
            hitSlop={10}
            style={styles.closeBtn}
          >
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.list}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {sortedPeriods.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Пока нет периодов. Добавьте первый ниже.
            </Text>
          ) : (
            sortedPeriods.map(period => (
              <Pressable
                key={period.id}
                onPress={() => {
                  setExpanded(false);
                  onPeriodPress(period.id);
                }}
                style={[
                  styles.periodRow,
                  { borderBottomColor: colors.border },
                ]}
              >
                <View
                  style={[
                    styles.colorDot,
                    {
                      backgroundColor: getPeriodColor(
                        palette,
                        period.paletteId,
                        resolved
                      ),
                    },
                  ]}
                />
                <Text
                  style={[styles.periodTitle, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {period.title}
                </Text>
                <Text
                  style={[styles.periodAge, { color: colors.textSecondary }]}
                >
                  {birthDate
                    ? formatPeriodAgeRange(
                        birthDate,
                        period.startDate,
                        period.endDate
                      )
                    : ''}
                </Text>
              </Pressable>
            ))
          )}
        </ScrollView>

        <Pressable
          onPress={() => {
            setExpanded(false);
            onAddPress();
          }}
          style={[styles.addBtn, { backgroundColor: colors.accent }]}
        >
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>Добавить период</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  collapsedWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 0,
  },
  collapsedBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: 14,
    paddingHorizontal: 20,
  },
  collapsedLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  expandedRoot: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  sheet: {
    maxHeight: '48%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: 0,
    paddingHorizontal: 20,
  },
  handleWrap: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 6,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  closeBtn: {
    position: 'absolute',
    right: 0,
    padding: 4,
  },
  list: {
    flexGrow: 0,
  },
  listContent: {
    paddingBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 16,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  colorDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  periodTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
  periodAge: {
    fontSize: 14,
    fontWeight: '500',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
