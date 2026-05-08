import { CellPaletteItem, WeekGrid } from '@/components/WeekGrid';
import { DEFAULT_PERIODS_PALLETE } from '@/constants/models';
import { loadBirthDate } from '@/lib/birth-date';
import { loadGridArrays, saveGridArraysFromBirthDate } from '@/lib/grid-arrays';
import { loadPeriodsPallete } from '@/lib/periods';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
const SCALE_OPTIONS = [
  { mode: 'weeks52', label: 'По неделям (2x)' },
  { mode: 'weeks', label: 'По неделям' },
  { mode: 'months', label: 'По месяцам' },
] as const;
const SLIDER_HEIGHT = 116;
const SLIDER_WIDTH_IDLE = 12;
const SLIDER_WIDTH_ACTIVE = 42;
const KNOB_SIZE = 24;
const COLLAPSE_DELAY_MS = 400;
const SLIDER_PADDING = 8;
const SLIDER_TRACK_HEIGHT = SLIDER_HEIGHT - SLIDER_PADDING * 2;
const SLIDER_STEP = SLIDER_TRACK_HEIGHT / (SCALE_OPTIONS.length - 1);

function modeToIndex(mode: 'weeks' | 'weeks52' | 'months'): number {
  if (mode === 'weeks52') {
    return 0;
  }
  if (mode === 'weeks') {
    return 1;
  }
  return 2;
}

export default function HomeScreen() {
  const [weeksArray, setWeeksArray] = useState<Uint8Array>(new Uint8Array(0));
  const [monthesArray, setMonthesArray] = useState<Uint8Array>(
    new Uint8Array(0)
  );
  const [cellPalette, setCellPalette] = useState<CellPaletteItem[]>(
    DEFAULT_PERIODS_PALLETE.items.map((color, index) => ({
      id: index,
      color,
      name: `state-${index}`,
    }))
  );
  const [hasData, setHasData] = useState(true);
  const [viewMode, setViewMode] = useState<'weeks' | 'weeks52' | 'months'>(
    'weeks'
  );
  const [sliderLabel, setSliderLabel] = useState<string | null>(null);
  const sliderLabelOpacity = useSharedValue(0);
  const sliderIsActive = useSharedValue(0);
  const sliderIndex = useSharedValue(modeToIndex(viewMode));
  const collapseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useFocusEffect(
    useCallback(() => {
      const loadWeeks = async () => {
        const [loadedBirthDate, storedArrays, storedPallete] =
          await Promise.all([
            loadBirthDate(),
            loadGridArrays(),
            loadPeriodsPallete(),
          ]);

        const nextPalette = (
          storedPallete ?? DEFAULT_PERIODS_PALLETE
        ).items.map((color, index) => ({
          id: index,
          color,
          name: `state-${index}`,
        }));
        setCellPalette(nextPalette);

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
      };

      void loadWeeks();
    }, [])
  );

  const switchViewMode = useCallback(
    (nextMode: 'weeks' | 'weeks52' | 'months') => {
      setViewMode(prevMode => {
        if (prevMode !== nextMode) {
          void Haptics.selectionAsync();
        }
        return nextMode;
      });
    },
    []
  );

  const cancelPendingCollapse = useCallback(() => {
    if (collapseTimeoutRef.current) {
      clearTimeout(collapseTimeoutRef.current);
      collapseTimeoutRef.current = null;
    }
  }, []);

  const showSlider = useCallback(() => {
    cancelPendingCollapse();
    sliderIsActive.value = withTiming(1, { duration: 180 });
    sliderLabelOpacity.value = withTiming(1, { duration: 140 });
  }, [cancelPendingCollapse, sliderIsActive, sliderLabelOpacity]);

  const hideSliderSoon = useCallback(() => {
    cancelPendingCollapse();
    collapseTimeoutRef.current = setTimeout(() => {
      sliderIsActive.value = withTiming(0, { duration: 220 });
      sliderLabelOpacity.value = withTiming(0, { duration: 180 });
      setSliderLabel(null);
    }, COLLAPSE_DELAY_MS);
  }, [cancelPendingCollapse, sliderIsActive, sliderLabelOpacity]);

  const handleSliderIndexChange = useCallback(
    (index: number) => {
      const option = SCALE_OPTIONS[index];
      if (!option) {
        return;
      }

      setSliderLabel(option.label);
      switchViewMode(option.mode);
    },
    [switchViewMode]
  );

  const switchToMoreDetailed = useCallback(() => {
    setViewMode(prev => {
      if (prev === 'months') {
        void Haptics.selectionAsync();
        return 'weeks';
      }
      if (prev === 'weeks') {
        void Haptics.selectionAsync();
        return 'weeks52';
      }
      return prev;
    });
  }, []);

  const switchToLessDetailed = useCallback(() => {
    setViewMode(prev => {
      if (prev === 'weeks52') {
        void Haptics.selectionAsync();
        return 'weeks';
      }
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

  useEffect(() => {
    sliderIndex.value = withTiming(modeToIndex(viewMode), { duration: 140 });
  }, [sliderIndex, viewMode]);

  useEffect(
    () => () => {
      if (collapseTimeoutRef.current) {
        clearTimeout(collapseTimeoutRef.current);
      }
    },
    []
  );

  const sliderGesture = useMemo(
    () =>
      Gesture.Pan()
        .onBegin(() => {
          'worklet';
          runOnJS(showSlider)();
        })
        .onUpdate(({ y }) => {
          'worklet';
          const clampedY = Math.max(
            0,
            Math.min(SLIDER_TRACK_HEIGHT, y - SLIDER_PADDING)
          );
          const nextIndex = Math.max(
            0,
            Math.min(
              SCALE_OPTIONS.length - 1,
              Math.round(clampedY / SLIDER_STEP)
            )
          );
          if (nextIndex !== sliderIndex.value) {
            sliderIndex.value = nextIndex;
            runOnJS(handleSliderIndexChange)(nextIndex);
          }
        })
        .onEnd(() => {
          'worklet';
          runOnJS(hideSliderSoon)();
        })
        .onFinalize(() => {
          'worklet';
          runOnJS(hideSliderSoon)();
        }),
    [handleSliderIndexChange, hideSliderSoon, showSlider, sliderIndex]
  );

  const sliderContainerAnimatedStyle = useAnimatedStyle(() => ({
    width:
      SLIDER_WIDTH_IDLE +
      sliderIsActive.value * (SLIDER_WIDTH_ACTIVE - SLIDER_WIDTH_IDLE),
    opacity: 0.42 + sliderIsActive.value * 0.58,
  }));

  const sliderDotTopAnimatedStyle = useAnimatedStyle(() => ({
    top: SLIDER_PADDING + sliderIndex.value * SLIDER_STEP - KNOB_SIZE / 2,
  }));

  const sliderDotAnimatedStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + sliderIsActive.value * 0.28,
    transform: [
      {
        scale: 0.58 + sliderIsActive.value * 0.42,
      },
    ],
  }));

  const sliderHintAnimatedStyle = useAnimatedStyle(() => ({
    opacity: sliderLabelOpacity.value,
    transform: [{ translateX: (1 - sliderLabelOpacity.value) * 6 }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <GestureDetector gesture={pinchGesture}>
          <View style={styles.gridContainer}>
            {hasData ? (
              <WeekGrid
                cellData={viewMode === 'months' ? monthesArray : weeksArray}
                palette={cellPalette}
                columns={
                  viewMode === 'months' ? 24 : viewMode === 'weeks52' ? 52 : 26
                }
                markerEveryRows={
                  viewMode === 'months' ? 1 : 2
                }
                splitAfter={viewMode === 'months' ? 12 : undefined}
                splitGap={viewMode === 'months' ? 4 : undefined}
                markerStep={
                  viewMode === 'months' || viewMode === 'weeks52' ? 2 : 1
                }
                markerSuffix=""
              />
            ) : (
              <View style={styles.placeholder}>
                <Text style={styles.placeholderTitle}>No data</Text>
                <Text style={styles.placeholderDescription}>
                  Укажите дату рождения в настройках
                </Text>
              </View>
            )}
          </View>
        </GestureDetector>

        {hasData ? (
          <View style={styles.scaleWrap} pointerEvents="box-none">
            <Animated.View
              style={[styles.scaleHintBubble, sliderHintAnimatedStyle]}
            >
              <Text style={styles.scaleHintText}>
                {sliderLabel ?? SCALE_OPTIONS[modeToIndex(viewMode)].label}
              </Text>
            </Animated.View>
            <GestureDetector gesture={sliderGesture}>
              <Animated.View
                style={[styles.scaleSlider, sliderContainerAnimatedStyle]}
              >
                <Animated.View
                  style={[styles.scaleDotPosition, sliderDotTopAnimatedStyle]}
                >
                  <Animated.View
                    style={[styles.scaleDot, sliderDotAnimatedStyle]}
                  />
                </Animated.View>
              </Animated.View>
            </GestureDetector>
          </View>
        ) : null}

        <View style={styles.bottomControlsWrap}>
          <View style={styles.controlsRow}>
            <Pressable
              style={styles.iconButton}
              onPress={() => router.push('/settings')}
            >
              <Ionicons name="settings-outline" size={18} color="#111827" />
            </Pressable>

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
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  placeholderTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  placeholderDescription: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
  },
  scaleWrap: {
    position: 'absolute',
    right: 10,
    bottom: 98,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scaleSlider: {
    height: SLIDER_HEIGHT,
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'flex-start',
    overflow: 'hidden',
  },
  scaleDotPosition: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  scaleDot: {
    width: KNOB_SIZE,
    height: KNOB_SIZE,
    borderRadius: KNOB_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.65)',
  },
  scaleHintBubble: {
    maxWidth: 152,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  scaleHintText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomControlsWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 12,
    paddingHorizontal: 16,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
});
