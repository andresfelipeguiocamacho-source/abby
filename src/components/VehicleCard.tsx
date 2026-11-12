import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { powertrainColor, powertrainLabel, type Vehicle } from '@/data/vehicles';
import { formatNumber } from '@/lib/format';
import { alpha, colors, fonts } from '@/lib/theme';
import { CarIllustration } from './CarIllustration';
import { AppText, Button, FavoriteButton, Icon, PressableScale, Tag, type IconName } from './ui';

export function vehicleSpecs(v: Vehicle): { icon: IconName; text: string }[] {
  const out: { icon: IconName; text: string }[] = [];
  if (v.powertrain === 'electrico') {
    out.push({ icon: 'mci:battery-charging-high', text: `${v.evRangeKm} km de autonomía` });
    if (v.fastChargeMin) out.push({ icon: 'mci:ev-plug-ccs2', text: `10→80 % en ${v.fastChargeMin} min` });
  } else {
    if (v.evRangeKm) out.push({ icon: 'mci:battery-charging-high', text: `Hasta ${v.evRangeKm} km en modo EV` });
    else
      out.push({
        icon: 'mci:battery-charging-high',
        text: v.powertrain === 'mild' ? 'Asistencia eléctrica 48 V' : 'Eléctrico en tráfico lento',
      });
    out.push({ icon: 'mci:gas-station-outline', text: `${formatNumber(v.kmPerL ?? 0, v.kmPerL && v.kmPerL % 1 ? 1 : 0)} km/l en ciudad` });
  }
  out.push({ icon: 'mci:speedometer', text: `${v.hp} hp` });
  return out;
}

/** Tarjeta de vehículo del catálogo (ilustración, precio, specs y acciones). */
export function VehicleCard({ v, compact }: { v: Vehicle; compact?: boolean }) {
  const color = powertrainColor[v.powertrain];
  const open = () => router.push({ pathname: '/vehiculo/[id]', params: { id: v.id } });

  return (
    <PressableScale onPress={open} scaleTo={0.98} style={[styles.card, compact && styles.compact]}>
      <View style={[styles.stage, compact && { height: 150 }]}>
        <LinearGradient
          colors={[alpha(color, 0.16), 'rgba(0,0,0,0)']}
          start={{ x: 0.5, y: 1 }}
          end={{ x: 0.5, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.grid} />
        <View style={styles.stageTop}>
          <View style={{ gap: 6 }}>
            <Tag label={powertrainLabel[v.powertrain]} color={color} />
            {v.used && <Tag label="Usado" color={colors.amber} />}
          </View>
          <FavoriteButton kind="vehicle" id={v.id} label={`${v.brand} ${v.model}`} />
        </View>
        <View style={styles.car}>
          <CarIllustration body={v.body} paint={v.paints[0]} width={compact ? 250 : 310} accent={color} id={`vc-${v.id}`} />
        </View>
      </View>

      <View style={styles.info}>
        <AppText variant="mono" style={{ letterSpacing: 3 }}>
          {v.brand.toUpperCase()} · {v.year}
        </AppText>
        <AppText variant={compact ? 'h3' : 'h2'} style={{ marginTop: 6 }} numberOfLines={1}>
          {v.model}
        </AppText>
        <AppText style={{ fontFamily: fonts.semibold, color, marginTop: 4 }} numberOfLines={1}>
          {v.tagline}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="mono" style={{ letterSpacing: 3 }}>
            DESDE
          </AppText>
          <AppText variant="price" style={compact ? { fontSize: 26 } : { fontSize: 38, lineHeight: 42 }}>
            ${v.priceM} M
          </AppText>
        </View>
        {!compact && (
          <>
            <View style={styles.sep} />
            <View style={{ gap: 12 }}>
              {vehicleSpecs(v).map((s) => (
                <View key={s.text} style={styles.spec}>
                  <Icon name={s.icon} size={18} color={color} />
                  <AppText variant="body" style={{ color: colors.textSoft }}>
                    {s.text}
                  </AppText>
                </View>
              ))}
            </View>
            <View style={{ gap: 10, marginTop: 20 }}>
              <Button label="Quiero este" iconRight="arrow-up-right" onPress={open} />
              <Button
                label="Agendar prueba"
                icon="calendar"
                variant="outline"
                onPress={() => router.push({ pathname: '/agendar', params: { id: v.id } })}
              />
            </View>
          </>
        )}
      </View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 30, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  compact: { width: 290 },
  stage: { height: 200, justifyContent: 'flex-end', backgroundColor: '#0A1018' },
  grid: { ...StyleSheet.absoluteFill, opacity: 0.25, borderBottomWidth: 1, borderColor: colors.border },
  stageTop: { position: 'absolute', top: 16, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between', zIndex: 2 },
  car: { alignItems: 'center', marginBottom: 8 },
  info: { padding: 22 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 18 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  spec: { flexDirection: 'row', alignItems: 'center', gap: 12 },
});
