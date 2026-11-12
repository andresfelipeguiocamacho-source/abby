import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown, LinearTransition } from 'react-native-reanimated';

import { AnimatedNumber, AppHeader, AppText, Backdrop, Button, Card, Chip, SectionHeader, Slider } from '@/components/ui';
import { vehicles } from '@/data/vehicles';
import { calculate, defaultCalcInput, type CalcInput, type CompareWith } from '@/lib/calculator';
import { formatCOP, formatNumber } from '@/lib/format';
import { colors, fonts } from '@/lib/theme';

const options: { key: CompareWith; label: string; color: string }[] = [
  { key: 'hibrido', label: 'Híbrido', color: colors.teal },
  { key: 'enchufable', label: 'Enchufable', color: colors.blue },
  { key: 'electrico', label: 'Eléctrico', color: colors.violet },
];

export default function Calculadora() {
  const [input, setInput] = useState<CalcInput>(defaultCalcInput);
  const r = useMemo(() => calculate(input), [input]);
  const set =
    <K extends keyof CalcInput>(k: K) =>
    (v: CalcInput[K]) =>
      setInput((i) => ({ ...i, [k]: v }));
  const color = options.find((o) => o.key === input.compareWith)!.color;
  const max = Math.max(r.currentMonthly, r.newMonthly, 1);

  const suggestions = vehicles
    .filter((v) => (input.compareWith === 'hibrido' ? v.powertrain === 'hibrido' : v.powertrain === input.compareWith) && !v.used)
    .sort((a, b) => a.priceM - b.priceM)
    .slice(0, 3);

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={color} />
      <AppHeader back title="Calculadora de ahorro" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <SectionHeader
          index="10"
          label="Criterio"
          title="¿Cuánto ahorras"
          highlight="en Bogotá?"
          subtitle="Ajustamos el cálculo a 2.600 m de altitud y al tráfico real de la ciudad, no a fichas de laboratorio."
        />

        <Card style={{ marginBottom: 18 }}>
          <AppText variant="label" style={{ marginBottom: 14 }}>
            Comparar mi carro actual con
          </AppText>
          <View style={{ flexDirection: 'row', gap: 10, flexWrap: 'wrap', marginBottom: 24 }}>
            {options.map((o) => (
              <Chip
                key={o.key}
                label={o.label}
                color={o.color}
                selected={input.compareWith === o.key}
                onPress={() => set('compareWith')(o.key)}
              />
            ))}
          </View>
          <Slider
            label="Kilómetros al mes"
            value={input.kmPerMonth}
            min={300}
            max={5000}
            step={100}
            onChange={set('kmPerMonth')}
            format={(v) => `${formatNumber(v)} km`}
          />
          <Slider
            label="Rendimiento de tu carro"
            value={input.currentKmPerGallon}
            min={20}
            max={60}
            step={1}
            onChange={set('currentKmPerGallon')}
            format={(v) => `${v} km/gal`}
          />
          <Slider
            label="Precio del galón"
            value={input.gasolinePerGallon}
            min={12000}
            max={20000}
            step={100}
            onChange={set('gasolinePerGallon')}
            format={(v) => formatCOP(v)}
          />
          {input.compareWith !== 'hibrido' && (
            <Animated.View entering={FadeInDown}>
              <Slider
                label="Carga en casa"
                value={Math.round(input.homeChargeShare * 100)}
                min={0}
                max={100}
                step={5}
                onChange={(v) => set('homeChargeShare')(v / 100)}
                format={(v) => `${v} %`}
              />
              <Slider
                label="Tarifa de energía en casa"
                value={input.homeKWhPrice}
                min={600}
                max={1200}
                step={10}
                onChange={set('homeKWhPrice')}
                format={(v) => `${formatCOP(v)}/kWh`}
              />
            </Animated.View>
          )}
        </Card>

        <Animated.View layout={LinearTransition}>
          <Card accent={input.compareWith === 'hibrido' ? 'teal' : input.compareWith === 'enchufable' ? 'blue' : 'violet'} intensity={0.25}>
            <AppText variant="label" color={color}>
              Ahorro mensual estimado
            </AppText>
            <AnimatedNumber value={r.monthlySavings} prefix="$" variant="display" color={colors.text} style={{ marginTop: 10 }} />

            <View style={{ gap: 14, marginTop: 22 }}>
              {[
                { label: 'Gasolina hoy', value: r.currentMonthly, c: colors.muted },
                { label: options.find((o) => o.key === input.compareWith)!.label, value: r.newMonthly, c: color },
              ].map((b) => (
                <View key={b.label}>
                  <View style={styles.between}>
                    <AppText variant="bodyStrong">{b.label}</AppText>
                    <AppText style={{ fontFamily: fonts.bold, color: b.c }}>{formatCOP(b.value)} / mes</AppText>
                  </View>
                  <View style={styles.track}>
                    <Animated.View
                      layout={LinearTransition.springify()}
                      style={[styles.fill, { width: `${(b.value / max) * 100}%`, backgroundColor: b.c }]}
                    />
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.kpis}>
              {[
                { label: 'Al año', value: r.yearlySavings, prefix: '$', suffix: '' },
                { label: 'En 5 años', value: r.fiveYearSavings, prefix: '$', suffix: '' },
                { label: 'CO₂ evitado / año', value: r.co2SavedKgYear, prefix: '', suffix: ' kg' },
              ].map((k) => (
                <View key={k.label} style={styles.kpi}>
                  <AppText variant="mono" style={{ fontSize: 10, letterSpacing: 2 }}>
                    {k.label.toUpperCase()}
                  </AppText>
                  <AnimatedNumber
                    value={k.value}
                    prefix={k.prefix}
                    suffix={k.suffix}
                    variant="title"
                    color={colors.text}
                    style={{ marginTop: 6 }}
                  />
                </View>
              ))}
            </View>
            <AppText variant="small" style={{ marginTop: 16, color: colors.faint }}>
              Incluye energía y mantenimiento. Es una estimación: el consumo real depende de tu ruta y forma de manejar.
            </AppText>
          </Card>
        </Animated.View>

        <AppText variant="label" style={{ marginTop: 28, marginBottom: 12 }}>
          Modelos que encajan
        </AppText>
        <View style={{ gap: 10 }}>
          {suggestions.map((v) => (
            <Button
              key={v.id}
              label={`${v.brand} ${v.model} · $${v.priceM} M`}
              variant="outline"
              iconRight="arrow-up-right"
              onPress={() => router.push({ pathname: '/vehiculo/[id]', params: { id: v.id } })}
            />
          ))}
        </View>
        <Button
          label="Hablar con un asesor"
          style={{ marginTop: 18 }}
          iconRight="arrow-right"
          onPress={() => router.push({ pathname: '/cotizacion', params: { tipo: 'asesoria' } })}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  track: { height: 10, borderRadius: 5, backgroundColor: colors.surface3, marginTop: 8, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 5 },
  kpis: { flexDirection: 'row', gap: 10, marginTop: 22, flexWrap: 'wrap' },
  kpi: { flex: 1, minWidth: 100, padding: 14, borderRadius: 18, backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.border },
});
