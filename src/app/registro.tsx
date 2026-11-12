import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { AppHeader, AppText, Backdrop, Button, Field, Icon, PressableScale, useToast } from '@/components/ui';
import { AuthError, useAuth } from '@/lib/auth';
import { goNext, useShake } from '@/lib/forms';
import { haptic } from '@/lib/haptics';
import { colors, fonts } from '@/lib/theme';

function passwordStrength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return s;
}

function StrengthBar({ value }: { value: number }) {
  const w = useDerivedValue(() => withTiming(value / 4, { duration: 250 }), [value]);
  const color = [colors.red, colors.red, colors.amber, colors.teal, colors.green][value];
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, { backgroundColor: color }, style]} />
    </View>
  );
}

export default function Registro() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { register } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [accept, setAccept] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(false);
  const { style, shake } = useShake();
  const strength = passwordStrength(password);

  const submit = async () => {
    const e = {
      name: name.trim().length < 3 ? 'Escribe tu nombre completo.' : null,
      email: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()) ? null : 'Correo inválido.',
      phone: phone.replace(/\D/g, '').length === 10 ? null : 'Celular de 10 dígitos.',
      password: password.length >= 8 ? null : 'Mínimo 8 caracteres.',
      accept: accept ? null : 'Debes aceptar la política de datos.',
    };
    setErrors(e);
    if (Object.values(e).some(Boolean)) {
      haptic.error();
      shake();
      return;
    }
    setLoading(true);
    try {
      const u = await register({ name, email, phone, password });
      haptic.success();
      toast({ title: `¡Bienvenido a AMPERIA, ${u.name.split(' ')[0]}!` });
      goNext(next);
    } catch (err) {
      setErrors({ email: err instanceof AuthError ? err.message : 'No pudimos crear la cuenta.' });
      haptic.error();
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.violet} />
      <AppHeader back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)}>
            <AppText variant="label">Crear cuenta</AppText>
            <AppText variant="h1" style={{ marginTop: 10 }}>
              Únete a AMPERIA
            </AppText>
            <AppText variant="body" style={{ marginTop: 8, fontSize: 16 }}>
              Un minuto y listo. Sin costo, nunca.
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(120)} style={[{ marginTop: 26 }, style]}>
            <Field
              label="Nombre completo"
              value={name}
              onChangeText={setName}
              autoComplete="name"
              icon="user"
              placeholder="Andrés Felipe Gómez"
              error={errors.name}
            />
            <Field
              label="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="mail"
              placeholder="tu@correo.com"
              error={errors.email}
            />
            <Field
              label="Celular (WhatsApp)"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              autoComplete="tel"
              icon="phone"
              placeholder="300 000 0000"
              error={errors.phone}
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="new-password"
              icon="lock"
              placeholder="Mínimo 8 caracteres"
              error={errors.password}
            />
            <View style={{ marginTop: -6, marginBottom: 18, gap: 6 }}>
              <StrengthBar value={strength} />
              <AppText variant="small">{['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Muy fuerte'][strength]}</AppText>
            </View>
            <PressableScale
              onPress={() => setAccept((a) => !a)}
              style={styles.accept}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: accept }}
            >
              <View style={[styles.box, accept && { backgroundColor: colors.teal, borderColor: colors.teal }]}>
                {accept && <Icon name="check" size={14} color={colors.onAccent} />}
              </View>
              <AppText variant="small" style={{ flex: 1, color: errors.accept ? colors.red : colors.textSoft }}>
                Acepto el tratamiento de mis datos personales (Ley 1581 de 2012) y los términos de uso.
              </AppText>
            </PressableScale>
            <Button label="Crear cuenta" iconRight="arrow-right" loading={loading} onPress={submit} style={{ marginTop: 18 }} />
          </Animated.View>
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 24 }}>
            <AppText variant="body">¿Ya tienes cuenta?</AppText>
            <PressableScale onPress={() => router.replace({ pathname: '/login', params: next ? { next } : {} })}>
              <AppText style={{ fontFamily: fonts.bold, color: colors.teal, fontSize: 15, lineHeight: 23 }}>Inicia sesión</AppText>
            </PressableScale>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, backgroundColor: colors.surface3, overflow: 'hidden' },
  fill: { height: 6, borderRadius: 3 },
  accept: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  box: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
