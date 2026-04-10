import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { WeekGrid } from '@/components/WeekGrid';
import { loadBirthDate } from '@/lib/birth-date';
import {
  DEFAULT_BIRTH_DATE,
  generateMonthsFromBirthDate,
  generateWeeksFromBirthDate,
  MonthData,
  WeekData,
} from '@/lib/weeks';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const [weeks, setWeeks] = useState<WeekData[]>(() =>
    generateWeeksFromBirthDate(DEFAULT_BIRTH_DATE)
  );
  const [months, setMonths] = useState<MonthData[]>(() =>
    generateMonthsFromBirthDate(DEFAULT_BIRTH_DATE)
  );
  const [viewMode, setViewMode] = useState<'weeks' | 'months'>('weeks');

  useFocusEffect(
    useCallback(() => {
      const loadWeeks = async () => {
        const loadedBirthDate = (await loadBirthDate()) ?? DEFAULT_BIRTH_DATE;
        setWeeks(generateWeeksFromBirthDate(loadedBirthDate));
        setMonths(generateMonthsFromBirthDate(loadedBirthDate));
      };

      void loadWeeks();
    }, [])
  );

  const monthCellsAsWeeks: WeekData[] = useMemo(
    () =>
      months.map(month => ({
        weekNumber: month.monthNumber,
        year: month.year,
        ageWeek: month.ageMonth,
        date: month.date,
        isCurrentWeek: month.isCurrentMonth,
        isPastWeek: month.isPastMonth,
        hasPeriod: month.hasPeriod,
        periodColor: month.periodColor,
        periodTitle: month.periodTitle,
      })),
    [months]
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.gridContainer}>
          <WeekGrid
            weeks={viewMode === 'weeks' ? weeks : monthCellsAsWeeks}
            columns={viewMode === 'weeks' ? 26 : 24}
            markerEveryRows={viewMode === 'weeks' ? 2 : 1}
            splitAfter={viewMode === 'weeks' ? undefined : 12}
            splitGap={viewMode === 'weeks' ? undefined : 4}
            markerStep={viewMode === 'weeks' ? 1 : 2}
            markerSuffix=""
          />
        </View>

        <View style={styles.switcherWrap}>
          <View style={styles.controlsRow}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={18} color="#111827" />
            </Pressable>

            <View style={styles.switcher}>
              <Pressable
                style={[
                  styles.switchButton,
                  viewMode === 'weeks' && styles.switchButtonActive,
                ]}
                onPress={() => setViewMode('weeks')}
              >
                <Text
                  style={[
                    styles.switchLabel,
                    viewMode === 'weeks' && styles.switchLabelActive,
                  ]}
                >
                  По неделям
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.switchButton,
                  viewMode === 'months' && styles.switchButtonActive,
                ]}
                onPress={() => setViewMode('months')}
              >
                <Text
                  style={[
                    styles.switchLabel,
                    viewMode === 'months' && styles.switchLabelActive,
                  ]}
                >
                  По месяцам
                </Text>
              </Pressable>
            </View>

            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/add-period')}
            >
              <Ionicons name="add" size={20} color="#111827" />
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
  },
  gridContainer: {
    flex: 1,
  },
  switcherWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  switcher: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  switchButton: {
    borderRadius: 18,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
  },
  switchLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
  switchLabelActive: {
    color: '#111827',
  },
});

