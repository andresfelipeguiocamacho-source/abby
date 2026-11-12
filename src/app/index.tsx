import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AmperiaMark, AmperiaWordmark } from '@/components/brand/AmperiaLogo';
import { AppText, Button } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { alpha, colors } from '@/lib/theme';

/**
 * Pantalla de bienvenida: único lugar donde aparece el logo violeta de AMPERIA.
 * Se muestra la primera vez; después la app abre directo en Inicio.
 */
export default function Welcome() {
  const { onboarded, loaded, setOnboarded } = useStore();
  const { ready } = useAuth();
  const insets = useSafeAreaInsets();

  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const glow = useSharedValue(0);
  const float = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSpring(1, { damping: 11, stiffness: 90 });
    glow.value = withDelay(500, withRepeat(withSequence(withTiming(1, { duration: 1800 }), withTiming(0.4, { duration: 1800 })), -1));
    float.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [glow, float, logoOpacity, logoScale]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { translateY: float.value * -8 }],
  }));
  const glowStyle = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ scale: 0.9 + glow.value * 0.2 }] }));

  if (!loaded || !ready) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  if (onboarded) return <Redirect href="/inicio" />;

  const start = (to: '/inicio' | '/login' | '/registro') => {
    haptic.medium();
    setOnboarded();
    if (to === '/inicio') router.replace('/inicio');
    else {
      router.replace('/inicio');
      setTimeout(() => router.push(to), 60);
    }
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <LinearGradient
        colors={[alpha(colors.brandViolet, 0.35), 'rgba(5,7,13,0)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(5,7,13,0)', alpha(colors.brandMagenta, 0.18)]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.center}>
        <Animated.View style={[styles.halo, glowStyle]} />
        <Animated.View style={logoStyle}>
          <AmperiaMark size={190} id="welcome" />
        </Animated.View>
        <Animated.View entering={FadeIn.delay(450).duration(700)} style={{ marginTop: 28 }}>
          <AmperiaWordmark width={250} color={colors.text} />
        </Animated.View>
        <Animated.View entering={FadeInDown.delay(750).duration(600)} style={styles.copy}>
          <AppText variant="h2" center>
            Tu híbrido o eléctrico, resuelto.
          </AppText>
          <AppText variant="body" center style={{ marginTop: 10 }}>
            Compra, carga, cotiza y paga desde un solo lugar. Hecho en Bogotá.
          </AppText>
        </Animated.View>
      </View>

      <Animated.View entering={FadeInDown.delay(1000).duration(600)} style={styles.actions}>
        <Button label="Comenzar" iconRight="arrow-right" shimmer onPress={() => start('/inicio')} />
        <View style={styles.row}>
          <Button label="Iniciar sesión" variant="outline" size="md" style={{ flex: 1 }} onPress={() => start('/login')} />
          <Button label="Crear cuenta" variant="outline" size="md" style={{ flex: 1 }} onPress={() => start('/registro')} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: alpha(colors.brandMagenta, 0.18),
    top: '50%',
    marginTop: -260,
  },
  copy: { marginTop: 36, paddingHorizontal: 10 },
  actions: { gap: 12 },
  row: { flexDirection: 'row', gap: 12 },
});
