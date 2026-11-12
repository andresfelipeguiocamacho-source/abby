import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Line, Path, Stop } from 'react-native-svg';

import type { BodyType, Paint } from '@/data/vehicles';
import { colors } from '@/lib/theme';
import { CarIllustration } from './CarIllustration';

/** Escenario con cordillera nocturna, estrellas y el carro flotando (como el hero de la web). */
export function HeroStage({
  body = 'suv',
  paint = { name: 'Blanco perla', base: '#F1F4F8', shade: '#A9B3C2' },
  height = 260,
  accent = colors.teal,
  id = 'hero',
}: {
  body?: BodyType;
  paint?: Paint;
  height?: number;
  accent?: string;
  id?: string;
}) {
  const { width: screenW } = useWindowDimensions();
  const width = Math.min(screenW - 40, 560);
  const float = useSharedValue(0);
  const road = useSharedValue(0);

  useEffect(() => {
    float.value = withRepeat(withTiming(1, { duration: 2600, easing: Easing.inOut(Easing.sin) }), -1, true);
    road.value = withRepeat(withTiming(1, { duration: 1200, easing: Easing.linear }), -1, false);
  }, [float, road]);

  const carStyle = useAnimatedStyle(() => ({ transform: [{ translateY: -6 * float.value }] }));
  const roadStyle = useAnimatedStyle(() => ({ transform: [{ translateX: -40 * road.value }] }));

  return (
    <View style={[styles.stage, { height }]}>
      <LinearGradient colors={['#0E1430', '#121A3D', '#0B1326']} style={StyleSheet.absoluteFill} />
      <Svg width="100%" height="100%" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        <Defs>
          <SvgGradient id={`${id}-m1`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#2B2F8F" />
            <Stop offset="1" stopColor="#151A4A" />
          </SvgGradient>
          <SvgGradient id={`${id}-m2`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1A6B73" />
            <Stop offset="1" stopColor="#0C2C3A" />
          </SvgGradient>
        </Defs>
        {[
          [40, 30, 1],
          [120, 18, 1.4],
          [210, 40, 1],
          [300, 22, 1.2],
          [360, 50, 0.9],
          [80, 70, 0.8],
          [250, 12, 0.8],
        ].map(([x, y, r], i) => (
          <Circle key={i} cx={x} cy={y} r={r} fill="#FFFFFF" opacity={0.7} />
        ))}
        <Path
          d="M0 170 L60 120 L110 150 L170 95 L230 150 L290 110 L350 150 L400 125 L400 260 L0 260 Z"
          fill={`url(#${id}-m1)`}
          opacity={0.9}
        />
        <Path d="M0 200 L70 160 L130 190 L200 150 L260 195 L330 165 L400 190 L400 260 L0 260 Z" fill={`url(#${id}-m2)`} />
        <Line x1="0" y1="232" x2="400" y2="232" stroke={accent} strokeOpacity={0.25} strokeWidth={1} />
      </Svg>
      <Animated.View style={[styles.road, roadStyle]}>
        {Array.from({ length: 16 }).map((_, i) => (
          <View key={i} style={[styles.dash, { backgroundColor: accent }]} />
        ))}
      </Animated.View>
      <Animated.View style={[styles.car, carStyle]}>
        <CarIllustration body={body} paint={paint} width={width * 0.92} accent={accent} id={`${id}-car`} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  stage: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, justifyContent: 'flex-end' },
  car: { alignItems: 'center', marginBottom: 22 },
  road: { position: 'absolute', bottom: 16, left: 0, flexDirection: 'row', gap: 18 },
  dash: { width: 22, height: 3, borderRadius: 2, opacity: 0.6 },
});
