import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';

import { AppHeader, AppText, Backdrop, Button, Card, Field, Icon, PressableScale } from '@/components/ui';
import { getProduct } from '@/data/products';
import { getVehicle } from '@/data/vehicles';
import { useAuth } from '@/lib/auth';
import { whatsappUrl } from '@/lib/config';
import { haptic } from '@/lib/haptics';
import { useStore, type QuoteType } from '@/lib/store';
import { alpha, colors, fonts } from '@/lib/theme';

const needs: { key: QuoteType; label: string }[] = [
  { key: 'vehiculo', label: 'Comprar un híbrido o eléctrico' },
  { key: 'cargador', label: 'Cargador para casa o empresa' },
  { key: 'estaciones', label: 'Cargar en las estaciones AMPERIA' },
  { key: 'repuesto', label: 'Repuestos y refacciones' },
  { key: 'asesoria', label: 'Asesoría para decidir bien' },
  { key: 'socio', label: 'Ser de los primeros socios' },
];

const placeholders: Record<QuoteType, string> = {
  vehiculo: 'Ej: quiero un híbrido usado para Uber, presupuesto de $110 M',
  cargador: 'Ej: casa en Cajicá, parqueadero propio, tengo un BYD Dolphin',
  estaciones: 'Ej: ¿cuál me sirve para cargar cerca a la Calle 80?',
  repuesto: 'Ej: inversor para Toyota Prius 2016',
  asesoria: 'Ej: voy a viajar a Villavicencio en un eléctrico',
  socio: 'Ej: quiero la tarjeta para mi flota de 3 carros',
};

const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim());
const isPhone = (s: string) => s.replace(/\D/g, '').length >= 10;

export default function Cotizacion() {
  const params = useLocalSearchParams<{ tipo?: QuoteType; id?: string; producto?: string }>();
  const vehicle = params.id ? getVehicle(params.id) : undefined;
  const product = params.producto ? getProduct(params.producto) : undefined;
  const { user } = useAuth();
  const { addQuote } = useStore();

  const [type, setType] = useState<QuoteType>(params.tipo ?? 'vehiculo');
  const [name, setName] = useState(user?.name ?? '');
  const [contact, setContact] = useState(user?.phone || user?.email || '');
  const [message, setMessage] = useState(
    vehicle
      ? `Quiero cotizar el ${vehicle.brand} ${vehicle.model} ${vehicle.year}.`
      : product
        ? `Quiero saber si mi instalación soporta el ${product.name}.`
        : '',
  );
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<string | null>(null);

  const submit = async () => {
    const e = {
      name: name.trim().length < 2 ? 'Escribe tu nombre.' : null,
      contact: !(isEmail(contact) || isPhone(contact)) ? 'Escribe un WhatsApp (10 dígitos) o un correo válido.' : null,
      message: message.trim().length < 8 ? 'Cuéntanos un poco más (mínimo 8 caracteres).' : null,
    };
    setErrors(e);
    if (e.name || e.contact || e.message) {
      haptic.error();
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 900));
    const q = addQuote({ type, vehicleId: vehicle?.id, name: name.trim(), contact: contact.trim(), message: message.trim() });
    setSending(false);
    haptic.success();
    setSent(q.id);
  };

  const label = needs.find((n) => n.key === type)!.label;

  if (sent) {
    return (
      <View style={{ flex: 1 }}>
        <Backdrop />
        <AppHeader back title="Solicitud enviada" />
        <View style={styles.done}>
          <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.doneIcon}>
            <Icon name="check" size={44} color={colors.onAccent} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200)} style={{ alignItems: 'center', gap: 10 }}>
            <AppText variant="h1" center>
              ¡Listo, {name.split(' ')[0]}!
            </AppText>
            <AppText variant="body" center style={{ fontSize: 16 }}>
              Recibimos tu solicitud ({label.toLowerCase()}). Una persona del equipo te escribe hoy mismo por{' '}
              {isEmail(contact) ? 'correo' : 'WhatsApp'}.
            </AppText>
            <AppText variant="mono" style={{ marginTop: 6 }}>
              Radicado {sent}
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(350)} style={{ gap: 12, alignSelf: 'stretch', marginTop: 20 }}>
            <Button
              label="Adelantar por WhatsApp"
              icon="message-circle"
              onPress={() => Linking.openURL(whatsappUrl(`Hola AMPERIA, soy ${name}. Radicado ${sent}. ${label}: ${message}`))}
            />
            <Button label="Volver al inicio" variant="outline" onPress={() => router.replace('/inicio')} />
          </Animated.View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.blue} />
      <AppHeader back title="Escríbenos" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInDown}>
            <AppText variant="label">13 — Escríbenos</AppText>
            <AppText variant="h1" style={{ marginTop: 10 }}>
              Cuéntanos qué{' '}
              <AppText variant="h1" color={colors.blue}>
                necesitas
              </AppText>
            </AppText>
            <AppText variant="body" style={{ marginTop: 10, fontSize: 16 }}>
              Un mensaje corto basta. Respondemos el mismo día hábil.
            </AppText>
          </Animated.View>

          {vehicle && (
            <Animated.View entering={FadeIn}>
              <Card style={{ marginTop: 18, flexDirection: 'row', gap: 12, alignItems: 'center', padding: 16 }}>
                <Icon name="mci:car-electric-outline" size={22} color={colors.teal} />
                <AppText variant="title" style={{ flex: 1 }}>
                  {vehicle.brand} {vehicle.model} · ${vehicle.priceM} M
                </AppText>
              </Card>
            </Animated.View>
          )}

          <Card style={{ marginTop: 18 }} accent="teal" intensity={0.1}>
            <AppText variant="bodyStrong" style={{ color: colors.text, marginBottom: 12 }}>
              ¿Qué necesitas?
            </AppText>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {needs.map((n) => {
                const on = n.key === type;
                return (
                  <PressableScale
                    key={n.key}
                    onPress={() => setType(n.key)}
                    scaleTo={0.98}
                    style={[styles.need, on && styles.needOn]}
                    accessibilityState={{ selected: on }}
                  >
                    <AppText style={{ fontFamily: fonts.semibold, fontSize: 16, color: on ? colors.teal : colors.textSoft, flex: 1 }}>
                      {n.label}
                    </AppText>
                    {on && (
                      <Animated.View entering={ZoomIn}>
                        <Icon name="check-circle" size={20} color={colors.teal} />
                      </Animated.View>
                    )}
                  </PressableScale>
                );
              })}
            </View>
            <Field
              label="Tu nombre"
              value={name}
              onChangeText={setName}
              placeholder="Andrés Felipe"
              autoComplete="name"
              error={errors.name}
            />
            <Field
              label="WhatsApp o correo"
              value={contact}
              onChangeText={setContact}
              placeholder="300 000 0000 o tu@correo.com"
              autoCapitalize="none"
              keyboardType="email-address"
              error={errors.contact}
            />
            <Field
              label="Cuéntanos un poco más"
              value={message}
              onChangeText={setMessage}
              placeholder={placeholders[type]}
              multiline
              error={errors.message}
            />
            <Button label="Enviar solicitud" iconRight="send" loading={sending} onPress={submit} />
            <View style={styles.trust}>
              {['Te lee una persona, no un bot.', 'No cobramos por conectarte.', 'Si no podemos ayudarte, te lo decimos.'].map((t, i) => (
                <View key={t} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                  <Icon name="shield" size={16} color={[colors.teal, colors.blue, colors.pink][i]} />
                  <AppText variant="small" style={{ color: colors.textSoft }}>
                    {t}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  need: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    minHeight: 60,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  needOn: {
    borderColor: colors.teal,
    backgroundColor: alpha(colors.teal, 0.08),
    shadowColor: colors.teal,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 0 },
  },
  trust: { gap: 10, marginTop: 18 },
  done: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 20 },
  doneIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOpacity: 0.6,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 0 },
  },
});
