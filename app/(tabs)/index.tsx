import { AppMenu } from '@/components/AppMenu';
import { HomeHeader } from '@/components/HomeHeader';
import { PeriodsLegendPanel } from '@/components/PeriodsLegendPanel';
import { CellPaletteItem, WeekGrid } from '@/components/WeekGrid';
import type { GridScalePreference } from '@/constants/app-theme';
import { DEFAULT_PERIODS_PALLETE, type PeriodPallete } from '@/constants/models';
import { useAppTheme } from '@/contexts/app-theme-context';
import { loadGridScalePreference } from '@/lib/app-settings';
import { loadBirthDate } from '@/lib/birth-date';
import { loadGridArrays, saveGridArraysFromBirthDate } from '@/lib/grid-arrays';
import {
  buildCellPalette,
  type LifePeriod,
  loadPeriods,
  loadPeriodsPallete,
} from '@/lib/periods';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { runOnJS } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { colors, resolved } = useAppTheme();
  const [weeksArray, setWeeksArray] = useState<Uint8Array>(new Uint8Array(0));
  const [monthesArray, setMonthesArray] = useState<Uint8Array>(
    new Uint8Array(0)
  );
  const [cellPalette, setCellPalette] = useState<CellPaletteItem[]>([]);
  const [hasData, setHasData] = useState(true);
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [gridScale, setGridScale] = useState<GridScalePreference>('weeks');
  const [menuOpen, setMenuOpen] = useState(false);
  const [periods, setPeriods] = useState<LifePeriod[]>([]);
  const [periodPalette, setPeriodPalette] = useState<PeriodPallete>(
    DEFAULT_PERIODS_PALLETE
  );

  const reloadGridData = useCallback(async () => {
    const [loadedBirthDate, storedArrays, storedPallete, storedGridScale, loadedPeriods] =
      await Promise.all([
        loadBirthDate(),
        loadGridArrays(),
        loadPeriodsPallete(),
        loadGridScalePreference(),
        loadPeriods(),
      ]);

    setBirthDate(loadedBirthDate);
    setGridScale(storedGridScale);
    setPeriods(loadedPeriods);

    const palette = storedPallete ?? DEFAULT_PERIODS_PALLETE;
    setPeriodPalette(palette);
    setCellPalette(buildCellPalette(palette, resolved));

    if (!loadedBirthDate && !storedArrays) {
      setHasData(false);
      setWeeksArray(new Uint8Array(0));
      setMonthesArray(new Uint8Array(0));
      return;
    }

    if (storedArrays) {
      setHasData(true);
      setWeeksArray(storedArrays.weeksArray);
      setMonthesArray(storedArrays.monthesArray);
      return;
    }

    if (!loadedBirthDate) {
      setHasData(false);
      setWeeksArray(new Uint8Array(0));
      setMonthesArray(new Uint8Array(0));
      return;
    }

    await saveGridArraysFromBirthDate(loadedBirthDate);
    const generatedArrays = await loadGridArrays();
    if (!generatedArrays) {
      setHasData(false);
      setWeeksArray(new Uint8Array(0));
      setMonthesArray(new Uint8Array(0));
      return;
    }

    setHasData(true);
    setWeeksArray(generatedArrays.weeksArray);
    setMonthesArray(generatedArrays.monthesArray);
  }, [resolved]);

  useFocusEffect(
    useCallback(() => {
      void reloadGridData();
    }, [reloadGridData])
  );

  const switchToMoreDetailed = useCallback(() => {
    setGridScale(prev => {
      if (prev === 'months') {
        void Haptics.selectionAsync();
        return 'weeks';
      }
      return prev;
    });
  }, []);

  const switchToLessDetailed = useCallback(() => {
    setGridScale(prev => {
      if (prev === 'weeks') {
        void Haptics.selectionAsync();
        return 'months';
      }
      return prev;
    });
  }, []);

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch().onEnd(({ scale }) => {
        'worklet';
        if (!hasData) {
          return;
        }

        if (scale > 1.08) {
          runOnJS(switchToMoreDetailed)();
        } else if (scale < 0.92) {
          runOnJS(switchToLessDetailed)();
        }
      }),
    [hasData, switchToLessDetailed, switchToMoreDetailed]
  );

  const handleGridScaleChange = useCallback((value: GridScalePreference) => {
    setGridScale(value);
  }, []);

  const handleDataReset = useCallback(() => {
    setBirthDate(null);
    setHasData(false);
    setWeeksArray(new Uint8Array(0));
    setMonthesArray(new Uint8Array(0));
    router.replace('/onboarding' as Href);
  }, []);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        content: {
          flex: 1,
        },
        gridContainer: {
          flex: 1,
          paddingBottom: 64,
        },
        placeholder: {
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        },
        placeholderTitle: {
          fontSize: 26,
          fontWeight: '700',
          color: colors.text,
          marginBottom: 8,
        },
        placeholderDescription: {
          fontSize: 15,
          color: colors.textSecondary,
          textAlign: 'center',
        },
      }),
    [colors]
  );

  const isMonths = gridScale === 'months';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <HomeHeader birthDate={birthDate} onMenuPress={() => setMenuOpen(true)} />

      <View style={styles.content}>
        <GestureDetector gesture={pinchGesture}>
          <View style={styles.gridContainer}>
            {hasData ? (
              <WeekGrid
                cellData={isMonths ? monthesArray : weeksArray}
                palette={cellPalette}
                columns={isMonths ? 24 : 52}
                markerEveryRows={isMonths ? 1 : 2}
                splitAfter={isMonths ? 12 : undefined}
                splitGap={isMonths ? 4 : undefined}
                markerStep={isMonths ? 2 : 2}
                markerSuffix=""
                backgroundColor={colors.background}
                markerTextColor={colors.textSecondary}
                markerTickColor={colors.textSecondary}
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderTitle}>Нет данных</Text>
                <Text style={styles.placeholderDescription}>
                  Укажите дату рождения в меню или пройдите онбординг
                </Text>
              </View>
            )}
          </View>
        </GestureDetector>

        <PeriodsLegendPanel
          periods={periods}
          palette={periodPalette}
          birthDate={birthDate}
          onPeriodPress={periodId =>
            router.push({
              pathname: '/add-period',
              params: { id: periodId },
            })
          }
          onAddPress={() => router.push('/add-period')}
        />
      </View>

      <AppMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        gridScale={gridScale}
        onGridScaleChange={handleGridScaleChange}
        onBirthDateSaved={() => void reloadGridData()}
        onDataReset={handleDataReset}
      />
    </SafeAreaView>
  );
}
