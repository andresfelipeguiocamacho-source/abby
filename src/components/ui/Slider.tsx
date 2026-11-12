import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { colors, gradients } from '@/lib/theme';
import { AppText } from './Text';

/** Deslizador táctil con pasos y vibración en cada paso. */
export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format = (v) => String(v),
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const [width, setWidth] = useState(0);
  const x = useSharedValue(0);
  const thumbScale = useSharedValue(1);
  const startX = useRef(0);
  const lastStep = useRef(value);
  const widthRef = useRef(0);
  widthRef.current = width;
  const valueRef = useRef(value);
  valueRef.current = value;

  const toX = (v: number, w: number) => ((v - min) / (max - min)) * w;

  useEffect(() => {
    if (width) x.value = withSpring(toX(value, width), { damping: 20, stiffness: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, width]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          thumbScale.value = withSpring(1.25);
          const w = widthRef.current;
          startX.current = Math.max(0, Math.min(w, e.nativeEvent.locationX));
          emit(startX.current);
        },
        onPanResponderMove: (_, g) => emit(startX.current + g.dx),
        onPanResponderRelease: () => {
          thumbScale.value = withSpring(1);
        },
        onPanResponderTerminate: () => {
          thumbScale.value = withSpring(1);
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [min, max, step],
  );

  function emit(px: number) {
    const w = widthRef.current || 1;
    const ratio = Math.max(0, Math.min(1, px / w));
    const raw = min + ratio * (max - min);
    const v = Math.round(raw / step) * step;
    const clamped = Math.max(min, Math.min(max, Number(v.toFixed(4))));
    if (clamped !== lastStep.current) {
      lastStep.current = clamped;
      haptic.tap();
      onChange(clamped);
    }
  }

  const fill = useAnimatedStyle(() => ({ width: x.value }));
  const thumb = useAnimatedStyle(() => ({ transform: [{ translateX: x.value - 14 }, { scale: thumbScale.value }] }));

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="bodyStrong" style={{ color: colors.text }}>
          {label}
        </AppText>
        <AppText variant="title" color={colors.teal}>
          {format(value)}
        </AppText>
      </View>
      <View
        style={styles.hit}
        onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
        {...responder.panHandlers}
        accessibilityRole="adjustable"
        accessibilityLabel={label}
        accessibilityValue={{ min, max, now: value, text: format(value) }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={(e) => {
          const dir = e.nativeEvent.actionName === 'increment' ? 1 : -1;
          onChange(Math.max(min, Math.min(max, valueRef.current + dir * step)));
        }}
      >
        <View style={styles.track} pointerEvents="none">
          <Animated.View style={[styles.fill, fill]}>
            <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
          </Animated.View>
        </View>
        <Animated.View pointerEvents="none" style={[styles.thumb, thumb]} />
      </View>
      <View style={styles.header}>
        <AppText variant="mono" style={{ fontSize: 11 }}>
          {format(min)}
        </AppText>
        <AppText variant="mono" style={{ fontSize: 11 }}>
          {format(max)}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 22 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hit: { height: 44, justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, backgroundColor: colors.surface3, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 4, overflow: 'hidden' },
  thumb: {
    position: 'absolute',
    left: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.text,
    borderWidth: 4,
    borderColor: colors.teal,
    shadowColor: colors.teal,
    shadowOpacity: 0.6,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
    elevation: 6,
  },
});
