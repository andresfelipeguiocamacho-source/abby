import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { colors, fonts } from '@/lib/theme';
import { AppText } from './ui';

/** Tarjeta de socio holográfica con brillo animado. */
export function MemberCard({ name, number }: { name?: string; number?: string }) {
  const tilt = useSharedValue(0);
  const shine = useSharedValue(-1);

  useEffect(() => {
    tilt.value = withRepeat(withTiming(1, { duration: 4200, easing: Easing.inOut(Easing.sin) }), -1, true);
    shine.value = withRepeat(
      withSequence(withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.quad) }), withTiming(-1, { duration: 0 })),
      -1,
    );
  }, [tilt, shine]);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 900 }, { rotateY: `${(tilt.value - 0.5) * 10}deg` }, { rotateX: `${(0.5 - tilt.value) * 4}deg` }],
  }));
  const shineStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shine.value * 380 }, { rotate: '18deg' }] }));

  return (
    <Animated.View style={[styles.wrap, cardStyle]}>
      <LinearGradient
        colors={['#1BB89C', '#101B3A', '#3A2A8C', '#C2477F']}
        locations={[0, 0.35, 0.7, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.View pointerEvents="none" style={[styles.shine, shineStyle]}>
        <LinearGradient
          colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.28)', 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <View style={styles.top}>
        <AppText style={styles.brand}>AMPERIA</AppText>
        <View style={styles.pill}>
          <AppText variant="mono" style={{ color: colors.text, letterSpacing: 3, fontSize: 10 }}>
            {name ? 'SOCIO FUNDADOR' : 'PRÓXIMAMENTE'}
          </AppText>
        </View>
      </View>
      <LinearGradient colors={['#E9EDF2', '#9AA3B1']} style={styles.chip} />
      <AppText variant="mono" style={{ color: 'rgba(5,7,13,0.75)', letterSpacing: 4, fontSize: 10, marginTop: 10 }}>
        TARJETA DE SOCIO
      </AppText>
      <AppText style={styles.title} numberOfLines={1}>
        {name ?? 'Tu híbrido o eléctrico, resuelto'}
      </AppText>
      <View style={styles.bottom}>
        <View style={styles.blocks}>
          {(number ?? '•••• •••• •••• ••••').split(' ').map((b, i) => (
            <View key={i} style={styles.block}>
              <AppText variant="mono" style={{ color: colors.text, fontSize: 11 }}>
                {b}
              </AppText>
            </View>
          ))}
        </View>
        <AppText variant="mono" style={{ color: 'rgba(5,7,13,0.8)' }}>
          Bogotá · CO
        </AppText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 28, padding: 22, overflow: 'hidden', aspectRatio: 1.62, borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)' },
  shine: { position: 'absolute', top: -80, bottom: -80, width: 90, left: 0 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontFamily: fonts.extrabold, fontSize: 22, color: colors.text, letterSpacing: -0.5 },
  pill: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(5,7,13,0.35)',
  },
  chip: { width: 52, height: 38, borderRadius: 8, marginTop: 18 },
  title: { fontFamily: fonts.extrabold, fontSize: 20, color: '#05070D', marginTop: 4, letterSpacing: -0.6 },
  bottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' },
  blocks: { flexDirection: 'row', gap: 6 },
  block: { paddingHorizontal: 6, paddingVertical: 4, borderRadius: 6, backgroundColor: 'rgba(5,7,13,0.35)' },
});
