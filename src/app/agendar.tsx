import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

import { CarIllustration } from '@/components/CarIllustration';
import { AppHeader, AppText, Backdrop, Button, Card, Chip, Icon, PressableScale } from '@/components/ui';
import { getVehicle, powertrainColor, vehicles } from '@/data/vehicles';
import { useAuth } from '@/lib/auth';
import { formatDate, formatDayLabel } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { alpha, colors, fonts } from '@/lib/theme';

const slots = ['8:00 a. m.', '9:30 a. m.', '11:00 a. m.', '2:00 p. m.', '3:30 p. m.', '5:00 p. m.'];

export default function Agendar() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { user } = useAuth();
  const { addTestDrive } = useStore();
  const [vehicleId, setVehicleId] = useState(id && getVehicle(id) ? id : vehicles[0].id);
  const v = getVehicle(vehicleId)!;

  const days = useMemo(() => {
    const out: Date[] = [];
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    while (out.length < 10) {
      d.setDate(d.getDate() + 1);
      if (d.getDay() !== 0) out.push(new Date(d));
    }
    return out;
  }, []);

  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [place, setPlace] = useState<'concesionario' | 'domicilio'>('concesionario');
  const [done, setDone] = useState<string | null>(null);

  // Simula disponibilidad: algunos horarios ocupados según el día.
  const busy = (i: number) => (day * 7 + i * 3) % 5 === 0;

  const confirm = () => {
    if (!slot) return;
    if (!user) {
      router.push('/login');
      return;
    }
    const t = addTestDrive({ vehicleId, date: days[day].toISOString(), slot, place });
    haptic.success();
    setDone(t.id);
  };

  if (done) {
    return (
      <View style={{ flex: 1 }}>
        <Backdrop tint={colors.violet} />
        <AppHeader back title="Prueba agendada" />
        <View style={styles.done}>
          <Animated.View entering={ZoomIn.springify().damping(10)} style={styles.doneIcon}>
            <Icon name="calendar" size={40} color={colors.text} />
          </Animated.View>
          <AppText variant="h1" center>
            ¡Nos vemos al volante!
          </AppText>
          <AppText variant="body" center style={{ fontSize: 16 }}>
            {v.brand} {v.model} · {formatDate(days[day].toISOString())} a las {slot}.{' '}
            {place === 'domicilio' ? 'Te llevamos el carro a tu casa u oficina.' : 'Te esperamos en el concesionario.'}
          </AppText>
          <AppText variant="mono">Reserva {done}</AppText>
          <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 12 }}>
            <Button label="Ver mis pruebas" onPress={() => router.replace({ pathname: '/pedidos', params: { tab: 'pruebas' } })} />
            <Button label="Seguir explorando" variant="outline" onPress={() => router.replace('/catalogo')} />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.violet} />
      <AppHeader back title="Agendar prueba" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card accent="violet" style={{ alignItems: 'center' }}>
          <Animated.View key={vehicleId} entering={FadeInDown.springify()}>
            <CarIllustration body={v.body} paint={v.paints[0]} width={290} accent={powertrainColor[v.powertrain]} id="agenda" />
          </Animated.View>
          <AppText variant="h2" center style={{ marginTop: 6 }}>
            {v.brand} {v.model}
          </AppText>
          <AppText variant="small">Prueba de manejo gratuita · 45 min</AppText>
        </Card>

        {!id && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 16 }}>
            {vehicles
              .filter((x) => !x.used)
              .map((x) => (
                <Chip
                  key={x.id}
                  size="sm"
                  label={x.model}
                  selected={x.id === vehicleId}
                  color={colors.violet}
                  onPress={() => setVehicleId(x.id)}
                />
              ))}
          </ScrollView>
        )}

        <AppText variant="label" style={{ marginTop: 22, marginBottom: 12 }}>
          Elige el día
        </AppText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
          {days.map((d, i) => {
            const on = i === day;
            return (
              <PressableScale
                key={d.toISOString()}
                onPress={() => {
                  setDay(i);
                  setSlot(null);
                }}
                style={[styles.day, on && styles.dayOn]}
              >
                <AppText variant="mono" style={{ color: on ? colors.onAccent : colors.muted }}>
                  {formatDayLabel(d).toUpperCase()}
                </AppText>
                <AppText style={{ fontFamily: fonts.extrabold, fontSize: 24, color: on ? colors.onAccent : colors.text }}>
                  {d.getDate()}
                </AppText>
              </PressableScale>
            );
          })}
        </ScrollView>

        <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>
          Elige la hora
        </AppText>
        <View style={styles.slots}>
          {slots.map((s, i) => {
            const isBusy = busy(i);
            const on = s === slot;
            return (
              <Animated.View key={`${day}-${s}`} entering={FadeInDown.delay(i * 40)} style={{ width: '31%', flexGrow: 1 }}>
                <PressableScale
                  onPress={isBusy ? undefined : () => setSlot(s)}
                  style={[styles.slot, on && styles.slotOn, isBusy && { opacity: 0.35 }]}
                  accessibilityState={{ disabled: isBusy, selected: on }}
                >
                  <AppText
                    style={{
                      fontFamily: fonts.semibold,
                      color: on ? colors.onAccent : colors.text,
                      textDecorationLine: isBusy ? 'line-through' : 'none',
                    }}
                  >
                    {s}
                  </AppText>
                </PressableScale>
              </Animated.View>
            );
          })}
        </View>

        <AppText variant="label" style={{ marginTop: 24, marginBottom: 12 }}>
          ¿Dónde?
        </AppText>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {(
            [
              ['concesionario', 'En el concesionario', 'mci:store-outline'],
              ['domicilio', 'Te lo llevamos', 'home'],
            ] as const
          ).map(([k, label, icon]) => (
            <PressableScale key={k} onPress={() => setPlace(k)} style={[styles.place, place === k && styles.placeOn]}>
              <Icon name={icon} size={22} color={place === k ? colors.teal : colors.muted} />
              <AppText variant="title" style={{ marginTop: 8, fontSize: 15 }}>
                {label}
              </AppText>
            </PressableScale>
          ))}
        </View>

        <Button
          label={!slot ? 'Elige una hora' : user ? 'Confirmar prueba' : 'Inicia sesión para confirmar'}
          disabled={!slot}
          iconRight="check"
          style={{ marginTop: 26 }}
          onPress={confirm}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  day: {
    width: 68,
    height: 84,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  dayOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slot: {
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotOn: { backgroundColor: colors.teal, borderColor: colors.teal },
  place: { flex: 1, padding: 18, borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  placeOn: { borderColor: colors.teal, backgroundColor: alpha(colors.teal, 0.08) },
  done: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', gap: 14 },
  doneIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.violet,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
});
