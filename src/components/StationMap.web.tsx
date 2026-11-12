import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { stationKindColor } from '@/data/stations';
import { colors, fonts } from '@/lib/theme';
import { AppText } from './ui';
import type { LatLng, StationMapHandle, StationMapProps } from './StationMap.types';

/**
 * Mapa estilizado de Bogotá para la vista web (react-native-maps no funciona en navegador).
 * En iOS y Android se usa el mapa real (StationMap.native.tsx).
 */
const BOUNDS = { north: 4.765, south: 4.565, west: -74.17, east: -74.0 };

function project(p: LatLng, w: number, h: number) {
  const x = ((p.longitude - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * w;
  const y = ((BOUNDS.north - p.latitude) / (BOUNDS.north - BOUNDS.south)) * h;
  return { x, y };
}

const zones: [string, LatLng][] = [
  ['SUBA', { latitude: 4.752, longitude: -74.095 }],
  ['USAQUÉN', { latitude: 4.705, longitude: -74.035 }],
  ['ENGATIVÁ', { latitude: 4.71, longitude: -74.115 }],
  ['FONTIBÓN', { latitude: 4.68, longitude: -74.155 }],
  ['TEUSAQUILLO', { latitude: 4.64, longitude: -74.085 }],
  ['CHAPINERO', { latitude: 4.655, longitude: -74.055 }],
  ['KENNEDY', { latitude: 4.62, longitude: -74.15 }],
  ['CENTRO', { latitude: 4.6, longitude: -74.07 }],
  ['RESTREPO', { latitude: 4.582, longitude: -74.11 }],
];

function Pulse({ color }: { color: string }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withRepeat(withTiming(1, { duration: 1600 }), -1, false);
  }, [p]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ scale: 1 + p.value * 1.4 }] }));
  return <Animated.View style={[styles.pulse, { borderColor: color }, style]} />;
}

export const StationMap = forwardRef<StationMapHandle, StationMapProps>(function StationMap(
  { stations, selectedId, onSelect, userLocation, height },
  ref,
) {
  const [w, setW] = useState(0);
  useImperativeHandle(ref, () => ({ focus: () => undefined }));
  const h = height;

  return (
    <View style={[styles.wrap, { height }]} onLayout={(e) => setW(e.nativeEvent.layout.width)}>
      {w > 0 && (
        <>
          <Svg width={w} height={h} style={StyleSheet.absoluteFill}>
            {/* Cerros orientales */}
            <Path
              d={`M${w * 0.86} 0 L${w} 0 L${w} ${h} L${w * 0.9} ${h} L${w * 0.84} ${h * 0.6} L${w * 0.9} ${h * 0.35} Z`}
              fill="#0E3B40"
              opacity={0.7}
            />
            {/* Río Bogotá */}
            <Path
              d={`M${w * 0.06} 0 Q${w * 0.02} ${h * 0.5} ${w * 0.08} ${h}`}
              stroke={colors.blue}
              strokeWidth={2}
              fill="none"
              opacity={0.7}
            />
            {/* Vías principales */}
            {[0.2, 0.38, 0.56, 0.74].map((y) => (
              <Path
                key={y}
                d={`M${w * 0.1} ${h * y} Q${w * 0.45} ${h * (y - 0.03)} ${w * 0.8} ${h * y}`}
                stroke="#2A3448"
                strokeWidth={5}
                fill="none"
                strokeLinecap="round"
              />
            ))}
            {[0.32, 0.48, 0.66].map((x) => (
              <Path key={x} d={`M${w * x} 0 L${w * (x - 0.02)} ${h}`} stroke="#2A3448" strokeWidth={5} strokeLinecap="round" />
            ))}
            {/* Anillo de la red */}
            <Path
              d={`M${w * 0.5} ${h * 0.06} Q${w * 0.9} ${h * 0.2} ${w * 0.86} ${h * 0.6} Q${w * 0.6} ${h * 0.98} ${w * 0.3} ${h * 0.86} Q${w * 0.06} ${h * 0.5} ${w * 0.5} ${h * 0.06}`}
              stroke={colors.violet}
              strokeDasharray="5 6"
              strokeWidth={1.5}
              fill="none"
              opacity={0.6}
            />
            {zones.map(([name, p]) => {
              const { x, y } = project(p, w, h);
              return (
                <SvgText key={name} x={x} y={y} fill="#5A6478" fontSize={11} fontFamily={fonts.mono} letterSpacing={3} textAnchor="middle">
                  {name}
                </SvgText>
              );
            })}
          </Svg>
          {userLocation &&
            (() => {
              const { x, y } = project(userLocation, w, h);
              return <View style={[styles.me, { left: x - 9, top: y - 9 }]} />;
            })()}
          {stations.map((s) => {
            const { x, y } = project(s, w, h);
            const c = stationKindColor[s.kind];
            const on = s.id === selectedId;
            const size = on ? 34 : 22;
            return (
              <Pressable
                key={s.id}
                onPress={() => onSelect(s.id)}
                accessibilityLabel={s.name}
                style={[styles.marker, { left: x - 22, top: y - 22 }]}
              >
                {on && <Pulse color={c} />}
                <View
                  style={{
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: c,
                    borderWidth: s.free ? 4 : 0,
                    borderColor: colors.pink,
                    shadowColor: c,
                    shadowOpacity: 0.9,
                    shadowRadius: on ? 16 : 8,
                  }}
                />
              </Pressable>
            );
          })}
          <View style={styles.tag}>
            <AppText variant="label" style={{ letterSpacing: 3 }}>
              Bogotá · Red AMPERIA
            </AppText>
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: '#0B1224' },
  marker: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 34, height: 34, borderRadius: 17, borderWidth: 2 },
  me: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.text,
    borderWidth: 4,
    borderColor: colors.blue,
  },
  tag: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(5,7,13,0.85)',
    borderWidth: 1,
    borderColor: colors.border,
  },
});
