import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { BoltBadge } from '@/components/brand/BoltBadge';
import { AppHeader, AppText, Backdrop, Button, Field, Icon, PressableScale, useToast } from '@/components/ui';
import { AuthError, useAuth } from '@/lib/auth';
import { goNext, useShake } from '@/lib/forms';
import { haptic } from '@/lib/haptics';
import { colors, fonts } from '@/lib/theme';

export default function Login() {
  const { next } = useLocalSearchParams<{ next?: string }>();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { style, shake } = useShake();

  const submit = async () => {
    setError(null);
    if (!email.includes('@') || password.length < 6) {
      setError('Escribe tu correo y una contraseña de al menos 6 caracteres.');
      haptic.error();
      shake();
      return;
    }
    setLoading(true);
    try {
      const u = await login(email, password);
      haptic.success();
      toast({ title: `Bienvenido, ${u.name.split(' ')[0]}` });
      goNext(next);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : 'No pudimos iniciar sesión. Intenta de nuevo.');
      haptic.error();
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.teal} />
      <AppHeader back />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeInDown.duration(500)}>
            <BoltBadge size={58} />
            <AppText variant="h1" style={{ marginTop: 22 }}>
              Hola de nuevo
            </AppText>
            <AppText variant="body" style={{ marginTop: 8, fontSize: 16 }}>
              Entra para pagar, seguir tus pedidos y guardar tus favoritos.
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(120).duration(500)} style={[{ marginTop: 28 }, style]}>
            <Field
              label="Correo"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              placeholder="tu@correo.com"
              icon="mail"
            />
            <Field
              label="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!show}
              autoComplete="password"
              placeholder="••••••••"
              icon="lock"
              onSubmitEditing={submit}
              right={
                <PressableScale onPress={() => setShow((s) => !s)} accessibilityLabel={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>
                  <Icon name={show ? 'eye-off' : 'eye'} size={18} color={colors.muted} />
                </PressableScale>
              }
              error={error}
            />
            <Button label="Iniciar sesión" iconRight="arrow-right" loading={loading} onPress={submit} style={{ marginTop: 6 }} />
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(240)} style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 28 }}>
            <AppText variant="body">¿No tienes cuenta?</AppText>
            <PressableScale onPress={() => router.replace({ pathname: '/registro', params: next ? { next } : {} })}>
              <AppText style={{ fontFamily: fonts.bold, color: colors.teal, fontSize: 15, lineHeight: 23 }}>Créala gratis</AppText>
            </PressableScale>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
