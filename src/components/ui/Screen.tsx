import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BoltBadge } from '@/components/brand/BoltBadge';
import { useStore } from '@/lib/store';
import { alpha, colors, fonts, gradients } from '@/lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './Pressable';
import { AppText } from './Text';

/** Fondo de la app con resplandores suaves de color. */
export function Backdrop({ tint = colors.teal }: { tint?: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.bg }]} />
      <LinearGradient
        colors={[alpha(tint, 0.14), 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.7, y: 0.45 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(0,0,0,0)', alpha(colors.violet, 0.08)]}
        start={{ x: 0.3, y: 0.6 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

/** Barra superior: insignia AMPERIA, botón atrás opcional y carrito con contador. */
export function AppHeader({ back, title, right }: { back?: boolean; title?: string; right?: ReactNode }) {
  const insets = useSafeAreaInsets();
  const { cartCount } = useStore();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
      <LinearGradient
        colors={gradients.spectrum}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.topLine, { top: insets.top }]}
      />
      <View style={styles.headerRow}>
        {back ? (
          <PressableScale
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/inicio'))}
            style={styles.circle}
            accessibilityLabel="Volver"
          >
            <Icon name="arrow-left" size={20} color={colors.text} />
          </PressableScale>
        ) : (
          <View style={styles.brand}>
            <BoltBadge size={38} />
            <AppText style={styles.brandText}>AMPERIA</AppText>
          </View>
        )}
        {title ? (
          <AppText variant="title" numberOfLines={1} style={styles.title}>
            {title}
          </AppText>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        <View style={styles.actions}>
          {right}
          <PressableScale
            onPress={() => router.push('/carrito')}
            style={styles.circle}
            accessibilityLabel={`Carrito, ${cartCount} productos`}
          >
            <Icon name="shopping-bag" size={19} color={colors.text} />
            {cartCount > 0 && (
              <Animated.View key={cartCount} entering={ZoomIn.springify().damping(10)} style={styles.badge}>
                <AppText style={styles.badgeText}>{cartCount > 9 ? '9+' : cartCount}</AppText>
              </Animated.View>
            )}
          </PressableScale>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: 'rgba(5,7,13,0.92)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    zIndex: 10,
  },
  topLine: { position: 'absolute', left: 0, right: 0, height: 2 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  brandText: { fontFamily: fonts.extrabold, fontSize: 21, letterSpacing: -0.6, color: colors.text },
  title: { flex: 1, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 10 },
  circle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.bg,
  },
  badgeText: { fontFamily: fonts.monoBold, fontSize: 10, color: colors.onAccent },
});
