import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, FadeOutLeft, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AnimatedNumber, AppHeader, AppText, Backdrop, Button, Card, Icon, IconBox, PressableScale } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { formatCOP } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Carrito() {
  const { cart, cartTotal, setQty, removeFromCart } = useStore();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <AppHeader back title="Tu carrito" />
      {cart.length === 0 ? (
        <Animated.View entering={FadeInDown} style={styles.empty}>
          <IconBox icon="shopping-bag" size={84} />
          <AppText variant="h2" center>
            Tu carrito está vacío
          </AppText>
          <AppText variant="body" center>
            Agrega un cargador, separa tu vehículo o recarga saldo para las estaciones.
          </AppText>
          <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 10 }}>
            <Button label="Ir a la tienda" onPress={() => router.replace('/tienda')} />
            <Button label="Ver vehículos" variant="outline" onPress={() => router.replace('/catalogo')} />
          </View>
        </Animated.View>
      ) : (
        <>
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 200 + insets.bottom, gap: 12 }}>
            {cart.map((item, i) => (
              <Animated.View
                key={item.key}
                entering={FadeInDown.delay(i * 60)}
                exiting={FadeOutLeft.duration(200)}
                layout={LinearTransition.springify().damping(18)}
              >
                <Card style={styles.item} padded={false} accent={item.accent} intensity={0.1}>
                  <IconBox
                    icon={item.kind === 'reserva' ? 'mci:car-electric-outline' : 'mci:lightning-bolt'}
                    accent={item.accent}
                    size={52}
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AppText variant="title" numberOfLines={2}>
                      {item.name}
                    </AppText>
                    <AppText variant="small" numberOfLines={1}>
                      {item.subtitle}
                    </AppText>
                    <AppText variant="title" color={colors.teal} style={{ marginTop: 6 }}>
                      {formatCOP(item.unitPrice * item.qty)}
                    </AppText>
                  </View>
                  <View style={styles.qty}>
                    <PressableScale
                      onPress={() => {
                        haptic.tap();
                        if (item.qty <= 1) removeFromCart(item.key);
                        else setQty(item.key, item.qty - 1);
                      }}
                      style={styles.qtyBtn}
                      accessibilityLabel={item.qty <= 1 ? 'Quitar' : 'Restar uno'}
                    >
                      <Icon name={item.qty <= 1 ? 'trash-2' : 'minus'} size={16} color={item.qty <= 1 ? colors.red : colors.text} />
                    </PressableScale>
                    <AppText variant="title" style={{ minWidth: 20, textAlign: 'center' }}>
                      {item.qty}
                    </AppText>
                    <PressableScale
                      onPress={() => setQty(item.key, item.qty + 1)}
                      style={[styles.qtyBtn, item.qty >= (item.maxQty ?? 99) && { opacity: 0.3 }]}
                      accessibilityLabel="Sumar uno"
                    >
                      <Icon name="plus" size={16} color={colors.text} />
                    </PressableScale>
                  </View>
                </Card>
              </Animated.View>
            ))}
            <View style={styles.secure}>
              <Icon name="lock" size={14} color={colors.muted} />
              <AppText variant="small">Pago seguro con tarjeta, PSE o Nequi. Separaciones 100 % reembolsables.</AppText>
            </View>
          </ScrollView>
          <Animated.View entering={FadeInDown.springify()} style={[styles.summary, { paddingBottom: insets.bottom + 16 }]}>
            <View style={styles.between}>
              <AppText variant="body">Subtotal</AppText>
              <AppText variant="bodyStrong">{formatCOP(cartTotal)}</AppText>
            </View>
            <View style={styles.between}>
              <AppText variant="body">IVA incluido</AppText>
              <AppText variant="bodyStrong">{formatCOP(cartTotal - cartTotal / 1.19)}</AppText>
            </View>
            <View style={[styles.between, { marginTop: 6 }]}>
              <AppText variant="h3">Total</AppText>
              <AnimatedNumber value={cartTotal} prefix="$" variant="h2" color={colors.teal} duration={500} />
            </View>
            <Button
              label={user ? 'Ir a pagar' : 'Inicia sesión para pagar'}
              iconRight="lock"
              shimmer
              style={{ marginTop: 12 }}
              onPress={() => router.push(user ? '/checkout' : { pathname: '/login', params: { next: '/checkout' } })}
            />
          </Animated.View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: { flex: 1, padding: 28, alignItems: 'center', justifyContent: 'center', gap: 12 },
  item: { flexDirection: 'row', gap: 14, alignItems: 'center', padding: 16 },
  qty: { alignItems: 'center', gap: 6 },
  qtyBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secure: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingHorizontal: 4, marginTop: 6 },
  summary: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    gap: 6,
    backgroundColor: 'rgba(8,11,19,0.98)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
