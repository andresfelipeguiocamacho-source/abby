import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppHeader, AppText, Backdrop, Button, Card, Chip, Field, Icon, PressableScale, useToast, type IconName } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { config } from '@/lib/config';
import { formatCOP } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { cardBrand, isValidCardNumber, isValidExpiry, pseBanks, processPayment } from '@/lib/payments';
import { useStore, type PaymentMethod } from '@/lib/store';
import { alpha, colors, fonts } from '@/lib/theme';

const methods: { key: PaymentMethod; label: string; icon: IconName }[] = [
  { key: 'tarjeta', label: 'Tarjeta', icon: 'credit-card' },
  { key: 'pse', label: 'PSE', icon: 'mci:bank-outline' },
  { key: 'nequi', label: 'Nequi', icon: 'smartphone' },
];

function formatCardNumber(v: string) {
  return v
    .replace(/\D/g, '')
    .slice(0, 19)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

function formatExpiry(v: string) {
  const d = v.replace(/\D/g, '').slice(0, 4);
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
}

function CardPreview({ number, holder, expiry }: { number: string; holder: string; expiry: string }) {
  const brand = cardBrand(number);
  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#14B8A6', '#1E3A8A', '#4C1D95']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.between}>
        <AppText style={{ fontFamily: fonts.extrabold, color: colors.text, fontSize: 18 }}>AMPERIA Pay</AppText>
        <Animated.View key={brand ?? 'none'} entering={FadeIn}>
          <AppText style={{ fontFamily: fonts.extrabold, color: colors.text, fontSize: 16, letterSpacing: 1 }}>
            {brand ? brand.toUpperCase() : ''}
          </AppText>
        </Animated.View>
      </View>
      <LinearGradient colors={['#E9EDF2', '#9AA3B1']} style={styles.cardChip} />
      <AppText style={styles.cardNumber}>{number ? formatCardNumber(number).padEnd(19, '•') : '•••• •••• •••• ••••'}</AppText>
      <View style={styles.between}>
        <View>
          <AppText variant="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
            TITULAR
          </AppText>
          <AppText style={{ fontFamily: fonts.semibold, color: colors.text }} numberOfLines={1}>
            {holder.toUpperCase() || 'NOMBRE APELLIDO'}
          </AppText>
        </View>
        <View>
          <AppText variant="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
            VENCE
          </AppText>
          <AppText style={{ fontFamily: fonts.semibold, color: colors.text }}>{expiry || 'MM/AA'}</AppText>
        </View>
      </View>
    </View>
  );
}

function Processing() {
  const r = useSharedValue(0);
  useEffect(() => {
    r.value = withRepeat(withTiming(1, { duration: 900, easing: Easing.linear }), -1, false);
  }, [r]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 360}deg` }] }));
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.overlay}>
      <Animated.View style={[styles.spinner, spin]}>
        <LinearGradient
          colors={[colors.teal, 'rgba(46,230,197,0)']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.spinnerHole} />
      </Animated.View>
      <AppText variant="h3" style={{ marginTop: 24 }}>
        Procesando tu pago…
      </AppText>
      <AppText variant="small" style={{ marginTop: 6 }}>
        No cierres la app
      </AppText>
    </Animated.View>
  );
}

export default function Checkout() {
  const { user } = useAuth();
  const { cart, cartTotal, placeOrder } = useStore();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const [method, setMethod] = useState<PaymentMethod>('tarjeta');
  const [number, setNumber] = useState('');
  const [holder, setHolder] = useState(user?.name ?? '');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [installments, setInstallments] = useState(1);
  const [bank, setBank] = useState<string | null>(null);
  const [nequi, setNequi] = useState(user?.phone ?? '');
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [processing, setProcessing] = useState(false);

  if (!user) return <Redirect href={{ pathname: '/login', params: { next: '/checkout' } }} />;
  if (cart.length === 0 && !processing) return <Redirect href="/carrito" />;

  const validate = () => {
    const e: Record<string, string | null> = {};
    if (method === 'tarjeta') {
      e.number = isValidCardNumber(number) ? null : 'Número de tarjeta inválido.';
      e.holder = holder.trim().length < 3 ? 'Escribe el nombre como aparece en la tarjeta.' : null;
      e.expiry = isValidExpiry(expiry) ? null : 'Fecha inválida o vencida.';
      e.cvc = /^\d{3,4}$/.test(cvc) ? null : 'CVC de 3 o 4 dígitos.';
    }
    if (method === 'pse') e.bank = bank ? null : 'Elige tu banco.';
    if (method === 'nequi') e.nequi = /^3\d{9}$/.test(nequi.replace(/\D/g, '')) ? null : 'Celular Nequi de 10 dígitos que empiece por 3.';
    setErrors(e);
    return Object.values(e).every((x) => !x);
  };

  const pay = async () => {
    if (!validate()) {
      haptic.error();
      return;
    }
    setProcessing(true);
    const res = await processPayment({
      amount: cartTotal,
      method,
      email: user.email,
      description: cart.map((c) => c.name).join(', '),
      card: method === 'tarjeta' ? { number, holder, expiry, cvc, installments } : undefined,
      pseBank: bank ?? undefined,
      nequiPhone: nequi,
    });
    if (res.status === 'approved' || res.status === 'pending') {
      const order = placeOrder(method, res.reference);
      haptic.success();
      router.replace({ pathname: '/pago-exitoso', params: { id: order.id } });
    } else {
      setProcessing(false);
      haptic.error();
      toast({ title: res.status === 'cancelled' ? 'Pago cancelado' : 'Pago rechazado', body: res.message, icon: 'x', color: colors.red });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <AppHeader back title="Pago seguro" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 140 + insets.bottom }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.methods}>
            {methods.map((m) => (
              <PressableScale
                key={m.key}
                onPress={() => setMethod(m.key)}
                style={[styles.method, method === m.key && styles.methodOn]}
                accessibilityState={{ selected: method === m.key }}
              >
                <Icon name={m.icon} size={22} color={method === m.key ? colors.teal : colors.muted} />
                <AppText variant="title" style={{ fontSize: 14, marginTop: 6, color: method === m.key ? colors.text : colors.muted }}>
                  {m.label}
                </AppText>
              </PressableScale>
            ))}
          </View>

          <Animated.View key={method} entering={FadeInDown.duration(350)}>
            {method === 'tarjeta' && (
              <>
                <CardPreview number={number} holder={holder} expiry={expiry} />
                <Card style={{ marginTop: 18 }}>
                  <Field
                    label="Número de tarjeta"
                    value={formatCardNumber(number)}
                    onChangeText={(t) => setNumber(t.replace(/\D/g, ''))}
                    keyboardType="number-pad"
                    placeholder="4242 4242 4242 4242"
                    icon="credit-card"
                    autoComplete="cc-number"
                    error={errors.number}
                  />
                  <Field
                    label="Nombre del titular"
                    value={holder}
                    onChangeText={setHolder}
                    autoCapitalize="characters"
                    autoComplete="cc-name"
                    error={errors.holder}
                  />
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="Vence"
                        value={expiry}
                        onChangeText={(t) => setExpiry(formatExpiry(t))}
                        keyboardType="number-pad"
                        placeholder="MM/AA"
                        error={errors.expiry}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field
                        label="CVC"
                        value={cvc}
                        onChangeText={(t) => setCvc(t.replace(/\D/g, '').slice(0, 4))}
                        keyboardType="number-pad"
                        secureTextEntry
                        placeholder="123"
                        error={errors.cvc}
                      />
                    </View>
                  </View>
                  <AppText variant="bodyStrong" style={{ color: colors.text, marginBottom: 10 }}>
                    Cuotas
                  </AppText>
                  <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                    {[1, 3, 6, 12, 24, 36].map((n) => (
                      <Chip
                        key={n}
                        size="sm"
                        label={n === 1 ? '1 cuota' : `${n}`}
                        selected={installments === n}
                        onPress={() => setInstallments(n)}
                      />
                    ))}
                  </View>
                </Card>
              </>
            )}

            {method === 'pse' && (
              <Card>
                <AppText variant="bodyStrong" style={{ color: colors.text, marginBottom: 12 }}>
                  Elige tu banco
                </AppText>
                <View style={{ gap: 8 }}>
                  {pseBanks.map((b) => (
                    <PressableScale key={b} onPress={() => setBank(b)} scaleTo={0.98} style={[styles.bank, bank === b && styles.methodOn]}>
                      <Icon name="mci:bank-outline" size={18} color={bank === b ? colors.teal : colors.muted} />
                      <AppText variant="title" style={{ flex: 1, fontSize: 15 }}>
                        {b}
                      </AppText>
                      {bank === b && <Icon name="check-circle" size={18} color={colors.teal} />}
                    </PressableScale>
                  ))}
                </View>
                {errors.bank ? (
                  <AppText variant="small" color={colors.red} style={{ marginTop: 10 }}>
                    {errors.bank}
                  </AppText>
                ) : null}
                <AppText variant="small" style={{ marginTop: 14 }}>
                  Te llevaremos a la página de tu banco para autorizar el pago.
                </AppText>
              </Card>
            )}

            {method === 'nequi' && (
              <Card accent="pink">
                <Field
                  label="Celular Nequi"
                  value={nequi}
                  onChangeText={setNequi}
                  keyboardType="phone-pad"
                  placeholder="300 000 0000"
                  icon="smartphone"
                  error={errors.nequi}
                />
                <AppText variant="body">Recibirás una notificación push en tu app Nequi para aceptar el pago.</AppText>
              </Card>
            )}
          </Animated.View>

          <Card style={{ marginTop: 18, gap: 10 }}>
            <AppText variant="label">Resumen</AppText>
            {cart.map((c) => (
              <View key={c.key} style={styles.between}>
                <AppText variant="body" style={{ flex: 1, color: colors.textSoft }} numberOfLines={1}>
                  {c.qty} × {c.name}
                </AppText>
                <AppText variant="bodyStrong">{formatCOP(c.qty * c.unitPrice)}</AppText>
              </View>
            ))}
            {config.paymentMode === 'demo' && (
              <View style={[styles.demo, { borderColor: alpha(colors.amber, 0.4) }]}>
                <Icon name="info" size={14} color={colors.amber} />
                <AppText variant="small" style={{ flex: 1, color: colors.textSoft }}>
                  Modo demostración: no se realiza ningún cobro. Usa 4242 4242 4242 4242 (aprobada) o una tarjeta terminada en 0002
                  (rechazada).
                </AppText>
              </View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bar, { paddingBottom: insets.bottom + 14 }]}>
        <View style={styles.between}>
          <AppText variant="body">Total a pagar</AppText>
          <AppText variant="h2" color={colors.teal}>
            {formatCOP(cartTotal)}
          </AppText>
        </View>
        <Button label={`Pagar ${formatCOP(cartTotal)}`} icon="lock" shimmer style={{ marginTop: 10 }} onPress={pay} loading={processing} />
      </View>

      {processing && <Processing />}
    </View>
  );
}

const styles = StyleSheet.create({
  methods: { flexDirection: 'row', gap: 10, marginBottom: 18 },
  method: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodOn: { borderColor: colors.teal, backgroundColor: alpha(colors.teal, 0.08) },
  card: { borderRadius: 26, padding: 22, aspectRatio: 1.6, overflow: 'hidden', justifyContent: 'space-between' },
  cardChip: { width: 48, height: 36, borderRadius: 8 },
  cardNumber: { fontFamily: fonts.monoBold, fontSize: 20, letterSpacing: 2, color: colors.text },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  bank: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  demo: { flexDirection: 'row', gap: 8, borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 6 },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: 'rgba(8,11,19,0.98)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,7,13,0.94)', alignItems: 'center', justifyContent: 'center', zIndex: 50 },
  spinner: { width: 84, height: 84, borderRadius: 42, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  spinnerHole: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.bg },
});
