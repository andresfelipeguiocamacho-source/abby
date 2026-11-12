import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Path } from 'react-native-svg';

import { AppText, Backdrop, Button, Card } from '@/components/ui';
import { formatCOP } from '@/lib/format';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

const ACircle = Animated.createAnimatedComponent(Circle);
const APath = Animated.createAnimatedComponent(Path);

function Confetti({ i }: { i: number }) {
  const t = useSharedValue(0);
  const palette = [colors.teal, colors.blue, colors.violet, colors.pink, colors.amber];
  const angle = (i / 18) * Math.PI * 2;
  useEffect(() => {
    t.value = withDelay(350, withTiming(1, { duration: 1100, easing: Easing.out(Easing.cubic) }));
  }, [t]);
  const style = useAnimatedStyle(() => ({
    opacity: 1 - t.value,
    transform: [
      { translateX: Math.cos(angle) * 140 * t.value },
      { translateY: Math.sin(angle) * 140 * t.value + 60 * t.value * t.value },
      { rotate: `${t.value * 360}deg` },
    ],
  }));
  return <Animated.View style={[styles.confetti, { backgroundColor: palette[i % palette.length] }, style]} />;
}

export default function PagoExitoso() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { orders } = useStore();
  const order = orders.find((o) => o.id === id);
  const insets = useSafeAreaInsets();

  const ring = useSharedValue(0);
  const check = useSharedValue(0);
  const pop = useSharedValue(0.6);
  useEffect(() => {
    ring.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    check.value = withDelay(500, withTiming(1, { duration: 450, easing: Easing.out(Easing.quad) }));
    pop.value = withSpring(1, { damping: 9 });
  }, [ring, check, pop]);

  const C = 2 * Math.PI * 54;
  const ringProps = useAnimatedProps(() => ({ strokeDashoffset: C * (1 - ring.value) }));
  const checkProps = useAnimatedProps(() => ({ strokeDashoffset: 80 * (1 - check.value) }));
  const popStyle = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));

  const hasReservation = order?.items.some((i) => i.kind === 'reserva');
  const credit = order?.items.reduce((s, i) => s + (i.walletCredit ?? 0) * i.qty, 0) ?? 0;

  return (
    <View style={[styles.root, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }]}>
      <Backdrop />
      <View style={styles.center}>
        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
          {Array.from({ length: 18 }).map((_, i) => (
            <Confetti key={i} i={i} />
          ))}
          <Animated.View style={popStyle}>
            <Svg width={130} height={130} viewBox="0 0 130 130">
              <Circle cx={65} cy={65} r={54} stroke={colors.surface3} strokeWidth={8} fill="none" />
              <ACircle
                cx={65}
                cy={65}
                r={54}
                stroke={colors.teal}
                strokeWidth={8}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${C} ${C}`}
                animatedProps={ringProps}
                transform="rotate(-90 65 65)"
              />
              <APath
                d="M42 67 L58 82 L90 49"
                stroke={colors.teal}
                strokeWidth={9}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="80 80"
                animatedProps={checkProps}
              />
            </Svg>
          </Animated.View>
        </View>
        <Animated.View entering={FadeInDown.delay(600)} style={{ alignItems: 'center', gap: 8, marginTop: 28 }}>
          <AppText variant="h1" center>
            ¡Pago aprobado!
          </AppText>
          <AppText variant="body" center style={{ fontSize: 16 }}>
            {hasReservation
              ? 'Tu vehículo quedó separado por 7 días. Un asesor te llama hoy para coordinar.'
              : credit > 0
                ? `Abonamos ${formatCOP(credit)} a tu saldo para cargar.`
                : 'Te enviamos la confirmación a tu correo. Un técnico te contacta para coordinar.'}
          </AppText>
        </Animated.View>
        {order && (
          <Animated.View entering={FadeInDown.delay(800)} style={{ alignSelf: 'stretch', marginTop: 24 }}>
            <Card style={{ gap: 10 }}>
              <View style={styles.between}>
                <AppText variant="mono">PEDIDO</AppText>
                <AppText variant="mono" color={colors.text}>
                  {order.id}
                </AppText>
              </View>
              {order.items.map((i) => (
                <View key={i.key} style={styles.between}>
                  <AppText variant="body" style={{ flex: 1, color: colors.textSoft }}>
                    {i.qty} × {i.name}
                  </AppText>
                  <AppText variant="bodyStrong">{formatCOP(i.qty * i.unitPrice)}</AppText>
                </View>
              ))}
              <View style={[styles.between, { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 10 }]}>
                <AppText variant="title">Total</AppText>
                <AppText variant="h3" color={colors.teal}>
                  {formatCOP(order.total)}
                </AppText>
              </View>
            </Card>
          </Animated.View>
        )}
      </View>
      <Animated.View entering={FadeInDown.delay(1000)} style={{ gap: 12 }}>
        <Button label="Ver mis pedidos" onPress={() => router.replace('/pedidos')} />
        <Button label="Volver al inicio" variant="outline" onPress={() => router.replace('/inicio')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, justifyContent: 'space-between' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  confetti: { position: 'absolute', width: 10, height: 14, borderRadius: 3 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
});
