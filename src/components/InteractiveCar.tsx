import { useEffect, useState } from 'react';
import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { hotspots } from '@/data/content';
import { haptic } from '@/lib/haptics';
import { alpha, colors } from '@/lib/theme';
import { CarIllustration } from './CarIllustration';
import { AppText, Chip, Icon, PressableScale, Tag } from './ui';

function Pulse({ color, delay }: { color: string; delay: number }) {
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, withRepeat(withTiming(1, { duration: 1800 }), -1, false));
  }, [p, delay]);
  const style = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ scale: 1 + p.value * 1.6 }] }));
  return <Animated.View pointerEvents="none" style={[styles.pulse, { borderColor: color }, style]} />;
}

/** "Toca el carro y descubre cómo funciona": puntos interactivos sobre el vehículo. */
export function InteractiveCar() {
  const [active, setActive] = useState(hotspots[0].key);
  const { width: screenW } = useWindowDimensions();
  const w = Math.min(screenW - 40, 560) - 24;
  const h = (w * 165) / 400;
  const spot = hotspots.find((s) => s.key === active)!;

  const select = (key: string) => {
    haptic.light();
    setActive(key);
  };

  return (
    <View>
      <View style={styles.chips}>
        {hotspots.map((s) => (
          <Chip key={s.key} size="sm" label={s.label} selected={active === s.key} color={s.color} onPress={() => select(s.key)} />
        ))}
      </View>

      <View style={styles.stage}>
        <View style={{ width: w, height: h }}>
          <CarIllustration
            body="suv"
            paint={{ name: 'Noche', base: '#1B2436', shade: '#0B1020' }}
            width={w}
            accent={colors.teal}
            id="interactive"
          />
          {hotspots.map((s, i) => {
            const on = s.key === active;
            return (
              <PressableScale
                key={s.key}
                haptics={false}
                onPress={() => select(s.key)}
                accessibilityLabel={s.label}
                style={[styles.spotHit, { left: s.x * w - 22, top: s.y * h - 22 }]}
              >
                {!on && <Pulse color={s.color} delay={i * 300} />}
                <View
                  style={[
                    styles.spot,
                    { borderColor: s.color, backgroundColor: on ? s.color : alpha(s.color, 0.18) },
                    on && { transform: [{ scale: 1.25 }], shadowColor: s.color, shadowOpacity: 0.9, shadowRadius: 12 },
                  ]}
                >
                  <View style={[styles.spotDot, { backgroundColor: on ? colors.bg : s.color }]} />
                </View>
              </PressableScale>
            );
          })}
        </View>
        <View style={styles.hint}>
          <Icon name="mouse-pointer" size={14} color={colors.teal} />
          <AppText variant="mono" style={{ letterSpacing: 3, fontSize: 11 }}>
            TOCA UN PUNTO PARA VER EL DETALLE
          </AppText>
        </View>
      </View>

      <Animated.View
        key={spot.key}
        entering={FadeInDown.springify().damping(16)}
        style={[styles.detail, { borderColor: alpha(spot.color, 0.4) }]}
      >
        <View style={[styles.detailBar, { backgroundColor: spot.color }]} />
        <Tag label={spot.label} color={spot.color} solid />
        <AppText variant="h2" style={{ marginTop: 16 }}>
          {spot.title}
        </AppText>
        <AppText variant="body" style={{ marginTop: 8, fontSize: 16 }}>
          {spot.body}
        </AppText>
        <Animated.View entering={FadeIn.delay(200)} style={styles.tip}>
          <AppText variant="label" color={spot.color}>
            Tip AMPERIA
          </AppText>
          <AppText variant="bodyStrong" style={{ marginTop: 8, color: colors.text }}>
            {spot.tip}
          </AppText>
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  stage: {
    backgroundColor: colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 26,
    alignItems: 'center',
  },
  spotHit: { position: 'absolute', width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pulse: { position: 'absolute', width: 26, height: 26, borderRadius: 13, borderWidth: 2 },
  spot: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  spotDot: { width: 9, height: 9, borderRadius: 5 },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 18 },
  detail: { marginTop: 16, padding: 22, borderRadius: 28, borderWidth: 1, backgroundColor: '#0B1A1B', overflow: 'hidden' },
  detailBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  tip: { marginTop: 18, padding: 18, borderRadius: 20, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
});
