import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AppHeader, AppText, Backdrop, Button, Card, Chip, Icon, Tag } from '@/components/ui';
import { getVehicle } from '@/data/vehicles';
import { formatCOP, formatDate } from '@/lib/format';
import { useStore, type QuoteType } from '@/lib/store';
import { colors } from '@/lib/theme';

type Tab = 'pedidos' | 'cotizaciones' | 'pruebas';

const quoteLabel: Record<QuoteType, string> = {
  vehiculo: 'Vehículo',
  cargador: 'Cargador',
  repuesto: 'Repuesto',
  asesoria: 'Asesoría',
  socio: 'Socio',
  estaciones: 'Estaciones',
};

const methodLabel = { tarjeta: 'Tarjeta', pse: 'PSE', nequi: 'Nequi' } as const;

export default function Pedidos() {
  const params = useLocalSearchParams<{ tab?: Tab }>();
  const [tab, setTab] = useState<Tab>(params.tab ?? 'pedidos');
  const { orders, quotes, testDrives } = useStore();

  const empty = (text: string, cta: string, go: () => void) => (
    <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 36 }}>
      <Icon name="inbox" size={30} color={colors.muted} />
      <AppText variant="body" center>
        {text}
      </AppText>
      <Button label={cta} size="md" variant="soft" onPress={go} />
    </Card>
  );

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <AppHeader back title="Mi actividad" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.tabs}>
          <Chip label="Pedidos" count={orders.length} selected={tab === 'pedidos'} onPress={() => setTab('pedidos')} />
          <Chip
            label="Cotizaciones"
            count={quotes.length}
            color={colors.blue}
            selected={tab === 'cotizaciones'}
            onPress={() => setTab('cotizaciones')}
          />
          <Chip
            label="Pruebas"
            count={testDrives.length}
            color={colors.violet}
            selected={tab === 'pruebas'}
            onPress={() => setTab('pruebas')}
          />
        </View>

        <Animated.View key={tab} entering={FadeInDown} style={{ gap: 14 }}>
          {tab === 'pedidos' &&
            (orders.length
              ? orders.map((o) => (
                  <Card key={o.id} accent="teal" style={{ gap: 12 }}>
                    <View style={styles.between}>
                      <AppText variant="mono">{o.id}</AppText>
                      <Tag
                        label={o.status === 'aprobado' ? 'Pagado' : 'Pendiente'}
                        color={o.status === 'aprobado' ? colors.green : colors.amber}
                      />
                    </View>
                    {o.items.map((i) => (
                      <View key={i.key} style={styles.between}>
                        <AppText variant="bodyStrong" style={{ flex: 1 }}>
                          {i.qty} × {i.name}
                        </AppText>
                        <AppText variant="bodyStrong">{formatCOP(i.unitPrice * i.qty)}</AppText>
                      </View>
                    ))}
                    <View style={styles.sep} />
                    <View style={styles.between}>
                      <AppText variant="small">
                        {formatDate(o.createdAt)} · {methodLabel[o.method]}
                      </AppText>
                      <AppText variant="h3" color={colors.teal}>
                        {formatCOP(o.total)}
                      </AppText>
                    </View>
                  </Card>
                ))
              : empty('Todavía no tienes pedidos.', 'Ir a la tienda', () => router.push('/tienda')))}

          {tab === 'cotizaciones' &&
            (quotes.length
              ? quotes.map((q) => (
                  <Card key={q.id} accent="blue" style={{ gap: 10 }}>
                    <View style={styles.between}>
                      <Tag label={quoteLabel[q.type]} color={colors.blue} />
                      <AppText variant="mono">{q.id}</AppText>
                    </View>
                    {q.vehicleId && (
                      <AppText variant="title">
                        {getVehicle(q.vehicleId)?.brand} {getVehicle(q.vehicleId)?.model}
                      </AppText>
                    )}
                    <AppText variant="body" numberOfLines={3}>
                      {q.message}
                    </AppText>
                    <View style={styles.between}>
                      <AppText variant="small">{formatDate(q.createdAt)}</AppText>
                      <AppText variant="small" color={colors.teal}>
                        Recibida · te contactamos hoy
                      </AppText>
                    </View>
                  </Card>
                ))
              : empty('No has pedido cotizaciones.', 'Pedir una cotización', () => router.push('/cotizacion')))}

          {tab === 'pruebas' &&
            (testDrives.length
              ? testDrives.map((t) => {
                  const v = getVehicle(t.vehicleId);
                  return (
                    <Card key={t.id} accent="violet" style={{ gap: 8 }}>
                      <View style={styles.between}>
                        <Tag label="Confirmada" color={colors.violet} />
                        <AppText variant="mono">{t.id}</AppText>
                      </View>
                      <AppText variant="h3">
                        {v?.brand} {v?.model}
                      </AppText>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Icon name="calendar" size={16} color={colors.violet} />
                        <AppText variant="bodyStrong">
                          {formatDate(t.date)} · {t.slot}
                        </AppText>
                      </View>
                      <AppText variant="small">{t.place === 'domicilio' ? 'Te llevamos el carro' : 'En el concesionario'}</AppText>
                    </Card>
                  );
                })
              : empty('No tienes pruebas de manejo agendadas.', 'Ver catálogo', () => router.push('/catalogo')))}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  sep: { height: 1, backgroundColor: colors.border },
});
