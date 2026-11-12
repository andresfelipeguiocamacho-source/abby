import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { CarIllustration } from '@/components/CarIllustration';
import { AppHeader, AppText, Backdrop, Button, Card, Field, Icon, PressableScale, useToast, type IconName } from '@/components/ui';
import { getVehicle } from '@/data/vehicles';
import { getStation } from '@/data/stations';
import { useAuth } from '@/lib/auth';
import { config, whatsappUrl } from '@/lib/config';
import { formatCOP } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { alpha, colors, fonts, gradients } from '@/lib/theme';

function Row({
  icon,
  label,
  detail,
  onPress,
  color = colors.text,
}: {
  icon: IconName;
  label: string;
  detail?: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <PressableScale onPress={onPress} scaleTo={0.98} style={styles.row}>
      <View style={styles.rowIcon}>
        <Icon name={icon} size={18} color={color} />
      </View>
      <AppText variant="title" style={{ flex: 1, color }}>
        {label}
      </AppText>
      {detail ? <AppText variant="mono">{detail}</AppText> : null}
      <Icon name="chevron-right" size={18} color={colors.faint} />
    </PressableScale>
  );
}

export default function Cuenta() {
  const { user, logout, updateProfile } = useAuth();
  const store = useStore();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  const favVehicles = store.favoriteVehicles.map(getVehicle).filter((v) => !!v);
  const favStations = store.favoriteStations.map(getStation).filter((s) => !!s);

  const help = (
    <Card padded={false} style={{ marginTop: 18 }}>
      <Row icon="help-circle" label="Preguntas frecuentes" onPress={() => router.push('/faq')} />
      <Row
        icon="message-circle"
        label="Escribir por WhatsApp"
        onPress={() => Linking.openURL(whatsappUrl('Hola AMPERIA, necesito ayuda.'))}
      />
      <Row
        icon="mail"
        label="Correo de soporte"
        detail={config.supportEmail}
        onPress={() => Linking.openURL(`mailto:${config.supportEmail}`)}
      />
      <Row icon="mci:calculator-variant-outline" label="Calculadora de ahorro" onPress={() => router.push('/calculadora')} />
    </Card>
  );

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <Backdrop tint={colors.violet} />
        <AppHeader />
        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Card accent="violet" intensity={0.25} style={{ gap: 14 }}>
              <AppText variant="label" color={colors.violet}>
                Tu cuenta AMPERIA
              </AppText>
              <AppText variant="h1">Todo en un solo lugar</AppText>
              {(
                [
                  ['shopping-bag', 'Compra cargadores, instalación y recargas'],
                  ['mci:car-electric-outline', 'Separa tu vehículo y agenda pruebas de manejo'],
                  ['file-text', 'Sigue tus cotizaciones y pedidos'],
                  ['heart', 'Guarda tus carros y estaciones favoritas'],
                ] as [IconName, string][]
              ).map(([i, t]) => (
                <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Icon name={i} size={18} color={colors.teal} />
                  <AppText variant="bodyStrong" style={{ flex: 1 }}>
                    {t}
                  </AppText>
                </View>
              ))}
              <Button label="Iniciar sesión" iconRight="arrow-right" style={{ marginTop: 8 }} onPress={() => router.push('/login')} />
              <Button label="Crear cuenta gratis" variant="outline" onPress={() => router.push('/registro')} />
            </Card>
          </Animated.View>
          {help}
        </ScrollView>
      </View>
    );
  }

  const initials = user.name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const stats: { label: string; value: number; href: Href }[] = [
    { label: 'Pedidos', value: store.orders.length, href: '/pedidos' },
    { label: 'Cotizaciones', value: store.quotes.length, href: { pathname: '/pedidos', params: { tab: 'cotizaciones' } } },
    { label: 'Pruebas', value: store.testDrives.length, href: { pathname: '/pedidos', params: { tab: 'pruebas' } } },
  ];

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.violet} />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View entering={FadeInDown.duration(500)} style={styles.profile}>
          <LinearGradient colors={gradients.spectrum} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.avatar}>
            <AppText style={{ fontFamily: fonts.extrabold, fontSize: 26, color: colors.onAccent }}>{initials}</AppText>
          </LinearGradient>
          <View style={{ flex: 1 }}>
            <AppText variant="h2" numberOfLines={1}>
              {user.name}
            </AppText>
            <AppText variant="small" numberOfLines={1}>
              {user.email}
            </AppText>
          </View>
          <PressableScale onPress={() => setEditing((e) => !e)} style={styles.edit} accessibilityLabel="Editar perfil">
            <Icon name={editing ? 'x' : 'edit-2'} size={18} color={colors.text} />
          </PressableScale>
        </Animated.View>

        {editing && (
          <Animated.View entering={FadeIn}>
            <Card style={{ marginTop: 16 }}>
              <Field label="Nombre" value={name} onChangeText={setName} icon="user" />
              <Field label="Celular" value={phone} onChangeText={setPhone} keyboardType="phone-pad" icon="phone" />
              <Button
                label="Guardar cambios"
                onPress={async () => {
                  await updateProfile({ name: name.trim() || user.name, phone: phone.trim() });
                  setEditing(false);
                  haptic.success();
                  toast({ title: 'Perfil actualizado' });
                }}
              />
            </Card>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(100)}>
          <PressableScale
            onPress={() => router.push({ pathname: '/tienda', params: { seccion: 'recargas' } })}
            scaleTo={0.98}
            style={styles.wallet}
          >
            <LinearGradient
              colors={[alpha(colors.teal, 0.25), alpha(colors.blue, 0.12)]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <View>
              <AppText variant="label">Saldo para cargar</AppText>
              <AppText variant="h1" style={{ marginTop: 6 }}>
                {formatCOP(store.wallet)}
              </AppText>
            </View>
            <View style={styles.walletBtn}>
              <Icon name="plus" size={20} color={colors.onAccent} />
            </View>
          </PressableScale>
        </Animated.View>

        <View style={styles.stats}>
          {stats.map((s, i) => (
            <Animated.View key={s.label} entering={FadeInDown.delay(150 + i * 60)} style={{ flex: 1 }}>
              <PressableScale onPress={() => router.push(s.href)} style={styles.stat}>
                <AppText variant="h2">{s.value}</AppText>
                <AppText variant="small" numberOfLines={1} adjustsFontSizeToFit>
                  {s.label}
                </AppText>
              </PressableScale>
            </Animated.View>
          ))}
        </View>

        {store.orders[0] && (
          <Card style={{ marginTop: 18, gap: 10 }} accent="teal">
            <AppText variant="label">Último pedido</AppText>
            <AppText variant="title">{store.orders[0].items.map((i) => i.name).join(', ')}</AppText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <AppText variant="mono">{store.orders[0].id}</AppText>
              <AppText variant="title" color={colors.teal}>
                {formatCOP(store.orders[0].total)}
              </AppText>
            </View>
          </Card>
        )}

        <AppText variant="label" style={{ marginTop: 28, marginBottom: 12 }}>
          Vehículos favoritos
        </AppText>
        {favVehicles.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
            {favVehicles.map((v) => (
              <PressableScale
                key={v!.id}
                onPress={() => router.push({ pathname: '/vehiculo/[id]', params: { id: v!.id } })}
                style={styles.fav}
              >
                <CarIllustration body={v!.body} paint={v!.paints[0]} width={170} id={`fav-${v!.id}`} glow={false} />
                <AppText variant="title" numberOfLines={1}>
                  {v!.model}
                </AppText>
                <AppText variant="mono">${v!.priceM} M</AppText>
              </PressableScale>
            ))}
          </ScrollView>
        ) : (
          <Card style={{ padding: 18 }}>
            <AppText variant="body">Toca el corazón en el catálogo para guardar vehículos aquí.</AppText>
          </Card>
        )}

        {favStations.length > 0 && (
          <>
            <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>
              Estaciones favoritas
            </AppText>
            <Card padded={false}>
              {favStations.map((s) => (
                <Row
                  key={s!.id}
                  icon="mci:ev-station"
                  label={s!.name}
                  detail={`${s!.powerKW} kW`}
                  color={colors.text}
                  onPress={() => router.push('/mapa')}
                />
              ))}
            </Card>
          </>
        )}

        <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>
          Mi actividad
        </AppText>
        <Card padded={false}>
          <Row icon="package" label="Mis pedidos" detail={String(store.orders.length)} onPress={() => router.push('/pedidos')} />
          <Row
            icon="file-text"
            label="Cotizaciones"
            detail={String(store.quotes.length)}
            onPress={() => router.push({ pathname: '/pedidos', params: { tab: 'cotizaciones' } })}
          />
          <Row
            icon="calendar"
            label="Pruebas de manejo"
            detail={String(store.testDrives.length)}
            onPress={() => router.push({ pathname: '/pedidos', params: { tab: 'pruebas' } })}
          />
        </Card>

        {help}

        <Button
          label="Cerrar sesión"
          variant="outline"
          icon="log-out"
          style={{ marginTop: 24 }}
          onPress={async () => {
            await logout();
            haptic.light();
            toast({ title: 'Sesión cerrada', icon: 'log-out', color: colors.muted });
          }}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  profile: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  edit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wallet: {
    marginTop: 20,
    borderRadius: 28,
    padding: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: alpha(colors.teal, 0.35),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.teal, alignItems: 'center', justifyContent: 'center' },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: { padding: 16, borderRadius: 22, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 2 },
  fav: { width: 200, padding: 14, borderRadius: 24, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, gap: 4 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 12, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
});
