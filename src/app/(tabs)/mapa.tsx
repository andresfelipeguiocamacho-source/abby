import * as Location from 'expo-location';
import { router } from 'expo-router';
import { useMemo, useRef, useState, type ComponentRef } from 'react';
import { Linking, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';

import { StationMap } from '@/components/StationMap';
import type { LatLng, StationMapHandle } from '@/components/StationMap.types';
import {
  AppHeader,
  AppText,
  Backdrop,
  Button,
  Card,
  Chip,
  FavoriteButton,
  Icon,
  PressableScale,
  SectionHeader,
  Tag,
  useToast,
} from '@/components/ui';
import { distanceKm, stationKindColor, stationKindLabel, stations, type Station } from '@/data/stations';
import { formatCOP, formatNumber } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { alpha, colors, fonts } from '@/lib/theme';

type Filter = 'todas' | 'rapida' | 'lenta' | 'solar' | 'gratis' | 'favoritas';

const filters: { key: Filter; label: string; color: string }[] = [
  { key: 'todas', label: 'Todas', color: colors.teal },
  { key: 'rapida', label: 'Rápidas', color: stationKindColor.rapida },
  { key: 'lenta', label: 'Lentas', color: stationKindColor.lenta },
  { key: 'solar', label: 'Solares', color: stationKindColor.solar },
  { key: 'gratis', label: 'Gratis', color: colors.pink },
  { key: 'favoritas', label: 'Favoritas', color: colors.pink },
];

function priceText(s: Station) {
  if (s.pricePerKWh === null) return s.priceNote ?? 'Gratis';
  return `${formatCOP(s.pricePerKWh)} / kWh`;
}

function directionsUrl(s: Station) {
  const q = `${s.latitude},${s.longitude}`;
  if (Platform.OS === 'ios') return `http://maps.apple.com/?daddr=${q}&dirflg=d`;
  return `https://www.google.com/maps/dir/?api=1&destination=${q}&travelmode=driving`;
}

export default function Mapa() {
  const { favoriteStations } = useStore();
  const toast = useToast();
  const mapRef = useRef<StationMapHandle>(null);
  const scrollRef = useRef<ComponentRef<typeof ScrollView>>(null);
  const [filter, setFilter] = useState<Filter>('todas');
  const [selectedId, setSelectedId] = useState<string>(stations[0].id);
  const [me, setMe] = useState<LatLng | null>(null);
  const [locating, setLocating] = useState(false);

  const visible = useMemo(() => {
    const list = stations.filter((s) => {
      if (filter === 'todas') return true;
      if (filter === 'gratis') return !!s.free;
      if (filter === 'favoritas') return favoriteStations.includes(s.id);
      return s.kind === filter;
    });
    if (me) list.sort((a, b) => distanceKm(me, a) - distanceKm(me, b));
    return list;
  }, [filter, favoriteStations, me]);

  const selected = stations.find((s) => s.id === selectedId) ?? stations[0];

  const select = (id: string) => {
    haptic.light();
    setSelectedId(id);
    const s = stations.find((x) => x.id === id);
    if (s) mapRef.current?.focus(s);
  };

  const locate = async () => {
    setLocating(true);
    try {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== 'granted') {
        toast({
          title: 'Permiso de ubicación denegado',
          body: 'Actívalo en Ajustes para ver la estación más cercana.',
          icon: 'map-pin',
          color: colors.amber,
        });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const p = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setMe(p);
      const nearest = [...stations].sort((a, b) => distanceKm(p, a) - distanceKm(p, b))[0];
      setSelectedId(nearest.id);
      mapRef.current?.focus(nearest);
      haptic.success();
      toast({ title: `Más cercana: ${nearest.name}`, body: `A ${formatNumber(distanceKm(p, nearest), 1)} km de ti`, icon: 'navigation' });
    } catch {
      toast({
        title: 'No pudimos obtener tu ubicación',
        body: 'Revisa que el GPS esté encendido.',
        icon: 'alert-triangle',
        color: colors.amber,
      });
    } finally {
      setLocating(false);
    }
  };

  const occupancy = selected.available / selected.ports;

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.blue} />
      <AppHeader />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <SectionHeader
          index="06"
          label="Estaciones"
          title="Nuestra red de carga"
          highlight="en el mapa"
          gradient={[colors.blue, colors.violet, colors.pink]}
          subtitle={`${stations.length} estaciones AMPERIA en Bogotá: rápidas, solares en Suba y el Sur, y puntos gratis para socios. Toca un punto para ver potencia, precio y cómo llegar.`}
        />

        <View style={styles.filters}>
          {filters.map((f) => (
            <Chip
              key={f.key}
              label={f.label}
              color={f.color}
              icon={f.key === 'favoritas' ? 'heart' : undefined}
              selected={filter === f.key}
              onPress={() => setFilter(f.key)}
            />
          ))}
          <Chip
            label={locating ? 'Buscando…' : me ? 'Cerca de mí ✓' : 'Cerca de mí'}
            icon="crosshair"
            color={colors.teal}
            selected={!!me}
            onPress={locate}
          />
        </View>

        <StationMap
          ref={mapRef}
          stations={visible}
          selectedId={selectedId}
          onSelect={select}
          userLocation={me}
          favorites={favoriteStations}
          height={380}
        />

        <View style={styles.legend}>
          {(['rapida', 'lenta', 'solar'] as const).map((k) => (
            <View key={k} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: stationKindColor[k] }]} />
              <AppText variant="small" style={{ color: colors.textSoft }}>
                {stationKindLabel[k]}
              </AppText>
            </View>
          ))}
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: colors.muted, borderWidth: 3, borderColor: colors.pink }]} />
            <AppText variant="small" style={{ color: colors.textSoft }}>
              Anillo rosa: gratis o para socios
            </AppText>
          </View>
        </View>

        {/* Ficha de la estación seleccionada */}
        <Animated.View key={selected.id} entering={FadeInDown.springify().damping(17)}>
          <Card
            accent={selected.kind === 'solar' ? 'amber' : selected.kind === 'lenta' ? 'blue' : 'teal'}
            intensity={0.2}
            style={{ gap: 16 }}
          >
            <View style={styles.rowBetween}>
              <Tag label={stationKindLabel[selected.kind]} color={stationKindColor[selected.kind]} />
              <FavoriteButton kind="station" id={selected.id} label={selected.name} />
            </View>
            <View>
              <AppText variant="h2">{selected.name}</AppText>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Icon name="map-pin" size={16} color={colors.teal} />
                <AppText variant="body">
                  {selected.address} · {selected.zone}
                  {me ? ` · ${formatNumber(distanceKm(me, selected), 1)} km` : ''}
                </AppText>
              </View>
            </View>

            <View style={styles.availability}>
              <View style={styles.rowBetween}>
                <AppText variant="mono" style={{ letterSpacing: 2 }}>
                  DISPONIBLES AHORA
                </AppText>
                <AppText variant="title" color={occupancy > 0.3 ? colors.teal : colors.amber}>
                  {selected.available} de {selected.ports}
                </AppText>
              </View>
              <View style={styles.bar}>
                <Animated.View
                  layout={LinearTransition}
                  style={[styles.barFill, { width: `${occupancy * 100}%`, backgroundColor: occupancy > 0.3 ? colors.teal : colors.amber }]}
                />
              </View>
            </View>

            <View style={styles.grid}>
              {[
                { icon: 'zap' as const, label: 'Potencia', value: `${selected.powerKW} kW` },
                { icon: 'mci:ev-plug-type2' as const, label: 'Conectores', value: selected.connectors.join(' · ') },
                { icon: 'mci:cash' as const, label: 'Precio', value: priceText(selected) },
                { icon: 'clock' as const, label: 'Horario', value: selected.hours },
              ].map((x) => (
                <View key={x.label} style={styles.cell}>
                  <View style={styles.row}>
                    <Icon name={x.icon} size={15} color={colors.muted} />
                    <AppText variant="mono" style={{ fontSize: 10, letterSpacing: 2 }}>
                      {x.label.toUpperCase()}
                    </AppText>
                  </View>
                  <AppText variant="title" style={{ marginTop: 8 }}>
                    {x.value}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.amenities}>
              {selected.amenities.map((a) => (
                <View key={a} style={styles.amenity}>
                  <AppText style={{ fontFamily: fonts.medium, color: colors.textSoft, fontSize: 14 }}>{a}</AppText>
                </View>
              ))}
            </View>

            <Button label="Cómo llegar" icon="navigation" onPress={() => Linking.openURL(directionsUrl(selected))} />
            <Button
              label="Recargar saldo para cargar"
              icon="mci:wallet-plus-outline"
              variant="outline"
              onPress={() => router.push({ pathname: '/tienda', params: { seccion: 'recargas' } })}
            />
          </Card>
        </Animated.View>

        {/* Lista */}
        <Card style={{ marginTop: 18, padding: 16 }}>
          <View style={[styles.rowBetween, { paddingHorizontal: 6, marginBottom: 12 }]}>
            <AppText variant="mono" style={{ letterSpacing: 3 }}>
              {me ? 'ORDENADAS POR DISTANCIA' : 'TODAS LAS ESTACIONES'}
            </AppText>
            <AppText variant="mono">{visible.length}</AppText>
          </View>
          <View style={{ gap: 10 }}>
            {visible.map((s) => {
              const on = s.id === selectedId;
              return (
                <Animated.View key={s.id} layout={LinearTransition.springify().damping(18)} entering={FadeIn}>
                  <PressableScale
                    onPress={() => {
                      select(s.id);
                      scrollRef.current?.scrollTo({ y: 520, animated: true });
                    }}
                    style={[styles.item, on && { borderColor: alpha(colors.teal, 0.6), backgroundColor: alpha(colors.teal, 0.08) }]}
                  >
                    <View
                      style={[
                        styles.itemDot,
                        { backgroundColor: stationKindColor[s.kind] },
                        s.free && { borderWidth: 3, borderColor: colors.pink },
                      ]}
                    />
                    <View style={{ flex: 1 }}>
                      <AppText variant="title">{s.name}</AppText>
                      <AppText variant="mono" style={{ marginTop: 4 }}>
                        {s.powerKW} KW · {priceText(s).toUpperCase()}
                      </AppText>
                    </View>
                    {me ? (
                      <AppText variant="mono" color={colors.teal}>
                        {formatNumber(distanceKm(me, s), 1)} km
                      </AppText>
                    ) : (
                      <Icon name="chevron-right" size={18} color={colors.muted} />
                    )}
                  </PressableScale>
                </Animated.View>
              );
            })}
            {visible.length === 0 && (
              <AppText variant="body" center style={{ paddingVertical: 20 }}>
                {filter === 'favoritas' ? 'Guarda estaciones con el corazón para verlas aquí.' : 'No hay estaciones con este filtro.'}
              </AppText>
            )}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 18 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginVertical: 18 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 16, height: 16, borderRadius: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  availability: { gap: 10 },
  bar: { height: 8, borderRadius: 4, backgroundColor: colors.surface3, overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: {
    width: '48%',
    flexGrow: 1,
    padding: 16,
    borderRadius: 20,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  amenities: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  amenity: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 999, borderWidth: 1, borderColor: colors.border },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bg,
  },
  itemDot: { width: 14, height: 14, borderRadius: 7 },
});
