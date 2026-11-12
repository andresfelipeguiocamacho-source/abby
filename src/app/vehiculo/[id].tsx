import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HeroStage } from '@/components/HeroStage';
import { vehicleSpecs } from '@/components/VehicleCard';
import {
  AnimatedNumber,
  AppHeader,
  AppText,
  Backdrop,
  Button,
  Card,
  FavoriteButton,
  Icon,
  PressableScale,
  Slider,
  Tag,
  useToast,
  type IconName,
} from '@/components/ui';
import { getVehicle, powertrainColor, powertrainLabel, RESERVATION_FEE } from '@/data/vehicles';
import { defaultCalcInput, monthlyCostForVehicle } from '@/lib/calculator';
import { whatsappUrl } from '@/lib/config';
import { formatCOP, formatNumber } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { alpha, colors, fonts } from '@/lib/theme';

export default function VehicleDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const v = getVehicle(String(id));
  const insets = useSafeAreaInsets();
  const { addToCart } = useStore();
  const toast = useToast();
  const [paintIdx, setPaintIdx] = useState(0);
  const [km, setKm] = useState(defaultCalcInput.kmPerMonth);

  if (!v) {
    return (
      <View style={{ flex: 1 }}>
        <Backdrop />
        <AppHeader back title="Vehículo" />
        <View style={{ padding: 24, gap: 16 }}>
          <AppText variant="h2">No encontramos este vehículo</AppText>
          <Button label="Ver catálogo" onPress={() => router.replace('/catalogo')} />
        </View>
      </View>
    );
  }

  const color = powertrainColor[v.powertrain];
  const paint = v.paints[paintIdx];
  const gasolineMonthly = (km / (defaultCalcInput.currentKmPerGallon * 0.94)) * defaultCalcInput.gasolinePerGallon;
  const thisMonthly = monthlyCostForVehicle(v, km);
  const saving = Math.max(0, gasolineMonthly - thisMonthly);
  const name = `${v.brand} ${v.model}`;

  const specs: { icon: IconName; label: string; value: string }[] = [
    { icon: 'mci:speedometer', label: 'Potencia', value: `${v.hp} hp` },
    v.powertrain === 'electrico'
      ? { icon: 'mci:battery-charging-high', label: 'Autonomía', value: `${v.evRangeKm} km` }
      : { icon: 'mci:gas-station-outline', label: 'Consumo ciudad', value: `${formatNumber(v.kmPerL ?? 0, 1)} km/l` },
    v.batteryKWh
      ? { icon: 'mci:car-battery', label: 'Batería', value: `${formatNumber(v.batteryKWh, 1)} kWh` }
      : { icon: 'mci:engine-outline', label: 'Sistema', value: powertrainLabel[v.powertrain] },
    v.fastChargeMin
      ? { icon: 'mci:ev-plug-ccs2', label: 'Carga 10→80 %', value: `${v.fastChargeMin} min` }
      : v.evRangeKm
        ? { icon: 'mci:leaf', label: 'Modo eléctrico', value: `${v.evRangeKm} km` }
        : { icon: 'mci:leaf', label: 'Arranque', value: 'Eléctrico' },
    { icon: 'mci:car-seat', label: 'Puestos', value: String(v.seats) },
    { icon: 'mci:bag-suitcase-outline', label: 'Baúl', value: `${v.trunkL} L` },
    { icon: 'mci:car-traction-control', label: 'Tracción', value: v.traction },
    { icon: 'mci:calendar-outline', label: 'Año', value: String(v.year) },
  ];

  const reserve = () => {
    addToCart({
      kind: 'reserva',
      refId: v.id,
      name: `Separación ${name}`,
      subtitle: `${paint.name} · reembolsable`,
      unitPrice: RESERVATION_FEE,
      accent: 'teal',
      maxQty: 1,
    });
    haptic.success();
    toast({
      title: 'Separación agregada',
      body: `${name} · ${formatCOP(RESERVATION_FEE)}`,
      icon: 'shopping-bag',
      action: { label: 'Pagar', onPress: () => router.push('/carrito') },
    });
  };

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={color} />
      <AppHeader back right={<FavoriteButton kind="vehicle" id={v.id} label={name} size={46} />} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 140 + insets.bottom }]} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeIn.duration(500)}>
          <HeroStage key={paint.name} body={v.body} paint={paint} accent={color} height={250} id={`detail-${v.id}`} />
        </Animated.View>

        <View style={styles.paints}>
          {v.paints.map((p, i) => (
            <PressableScale
              key={p.name}
              onPress={() => setPaintIdx(i)}
              accessibilityLabel={`Color ${p.name}`}
              style={[styles.swatchRing, i === paintIdx && { borderColor: color }]}
            >
              <View style={[styles.swatch, { backgroundColor: p.base }]}>
                <View style={[styles.swatchShade, { backgroundColor: p.shade }]} />
              </View>
            </PressableScale>
          ))}
          <Animated.View key={paint.name} entering={FadeIn} style={{ marginLeft: 6 }}>
            <AppText variant="mono">{paint.name.toUpperCase()}</AppText>
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(100)} style={{ marginTop: 22 }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Tag label={powertrainLabel[v.powertrain]} color={color} />
            {v.used && <Tag label="Usado" color={colors.amber} />}
            {(v.powertrain === 'electrico' || v.powertrain === 'hibrido' || v.powertrain === 'enchufable') && (
              <Tag label="Sin pico y placa*" color={colors.green} />
            )}
          </View>
          <AppText variant="mono" style={{ letterSpacing: 3, marginTop: 18 }}>
            {v.brand.toUpperCase()} · {v.year}
          </AppText>
          <AppText variant="h1" style={{ marginTop: 6 }}>
            {v.model}
          </AppText>
          <AppText style={{ fontFamily: fonts.semibold, color, fontSize: 16, marginTop: 6 }}>{v.tagline}</AppText>
          <View style={styles.priceRow}>
            <AppText variant="mono" style={{ letterSpacing: 3 }}>
              DESDE
            </AppText>
            <AppText variant="price" style={{ fontSize: 44, lineHeight: 48 }}>
              ${v.priceM} M
            </AppText>
          </View>
          <AppText variant="small" style={{ color: colors.faint }}>
            Precio de referencia · se confirma con el concesionario
          </AppText>
        </Animated.View>

        <View style={styles.specGrid}>
          {specs.map((s, i) => (
            <Animated.View
              key={s.label}
              entering={ZoomIn.delay(150 + i * 40)
                .springify()
                .damping(16)}
              style={styles.spec}
            >
              <View style={styles.specHead}>
                <Icon name={s.icon} size={16} color={color} />
                <AppText variant="mono" style={{ letterSpacing: 2, fontSize: 10 }}>
                  {s.label.toUpperCase()}
                </AppText>
              </View>
              <AppText variant="title" style={{ fontSize: 17 }}>
                {s.value}
              </AppText>
            </Animated.View>
          ))}
        </View>

        <Card accent="teal" style={{ marginTop: 18 }}>
          <AppText variant="label">Tu ahorro estimado</AppText>
          <AppText variant="h3" style={{ marginTop: 8, marginBottom: 18 }}>
            Frente a un carro a gasolina de {defaultCalcInput.currentKmPerGallon} km/galón
          </AppText>
          <Slider
            label="Kilómetros al mes"
            value={km}
            min={300}
            max={4000}
            step={100}
            onChange={setKm}
            format={(x) => `${formatNumber(x)} km`}
          />
          <View style={styles.compare}>
            <View style={{ flex: 1 }}>
              <AppText variant="mono" style={{ fontSize: 10, letterSpacing: 2 }}>
                GASOLINA / MES
              </AppText>
              <AnimatedNumber value={gasolineMonthly} prefix="$" variant="h3" color={colors.textSoft} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="mono" style={{ fontSize: 10, letterSpacing: 2 }}>
                ESTE CARRO / MES
              </AppText>
              <AnimatedNumber value={thisMonthly} prefix="$" variant="h3" color={color} />
            </View>
          </View>
          <View style={[styles.saving, { borderColor: alpha(colors.teal, 0.4) }]}>
            <AppText variant="small" style={{ color: colors.textSoft }}>
              Ahorras al año en energía
            </AppText>
            <AnimatedNumber value={saving * 12} prefix="$" variant="price" color={colors.teal} />
          </View>
          <Button
            label="Calculadora completa"
            variant="soft"
            icon="mci:calculator-variant-outline"
            size="md"
            onPress={() => router.push('/calculadora')}
          />
        </Card>

        <Card style={{ marginTop: 18, gap: 14 }}>
          <AppText variant="label">Lo que destaca</AppText>
          {[...vehicleSpecs(v).map((s) => s.text), ...v.highlights].map((h) => (
            <View key={h} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={[styles.check, { backgroundColor: alpha(color, 0.15) }]}>
                <Icon name="check" size={14} color={color} />
              </View>
              <AppText variant="bodyStrong" style={{ flex: 1 }}>
                {h}
              </AppText>
            </View>
          ))}
        </Card>

        <Card accent="blue" style={{ marginTop: 18, gap: 12 }}>
          <AppText variant="label" color={colors.blue}>
            Sepáralo desde la app
          </AppText>
          <AppText variant="h3">
            Aparta este {v.model} por {formatCOP(RESERVATION_FEE)}
          </AppText>
          <AppText variant="body">
            Bloqueamos la unidad y el precio con el vendedor por 7 días mientras cierras el negocio. Si no compras, te devolvemos el 100 %.
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              label="Cotizar"
              variant="outline"
              size="md"
              icon="file-text"
              style={{ flex: 1 }}
              onPress={() => router.push({ pathname: '/cotizacion', params: { tipo: 'vehiculo', id: v.id } })}
            />
            <Button
              label="WhatsApp"
              variant="outline"
              size="md"
              icon="message-circle"
              style={{ flex: 1 }}
              onPress={() => Linking.openURL(whatsappUrl(`Hola AMPERIA, me interesa el ${name} (${v.year}).`))}
            />
          </View>
        </Card>
      </ScrollView>

      <Animated.View entering={FadeInDown.delay(300).springify().damping(18)} style={[styles.bar, { paddingBottom: insets.bottom + 12 }]}>
        <Button
          label="Prueba"
          variant="outline"
          icon="calendar"
          style={{ flex: 0.8 }}
          onPress={() => router.push({ pathname: '/agendar', params: { id: v.id } })}
        />
        <Button label="Separar" iconRight="arrow-right" shimmer style={{ flex: 1.2 }} onPress={reserve} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20 },
  paints: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 16 },
  swatchRing: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 32, height: 32, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  swatchShade: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: 18 },
  specGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 22 },
  spec: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
    gap: 8,
  },
  specHead: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  compare: { flexDirection: 'row', gap: 12 },
  saving: { marginVertical: 16, padding: 16, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(46,230,197,0.06)' },
  check: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    backgroundColor: 'rgba(5,7,13,0.96)',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
