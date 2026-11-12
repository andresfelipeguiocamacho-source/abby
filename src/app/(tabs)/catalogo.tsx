import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut, LinearTransition } from 'react-native-reanimated';

import { VehicleCard } from '@/components/VehicleCard';
import { AppHeader, AppText, Backdrop, Card, Chip, Icon, PressableScale, SectionHeader } from '@/components/ui';
import { vehicles, type Vehicle } from '@/data/vehicles';
import { useStore } from '@/lib/store';
import { colors, fonts } from '@/lib/theme';

type TypeFilter = 'todos' | 'hibrido' | 'enchufable' | 'electrico' | 'usados' | 'favoritos';
type PriceFilter = 'todos' | 'hasta120' | '120a200' | 'mas200';
type Sort = 'relevancia' | 'precio' | 'eficiencia' | 'potencia';

const typeFilters: { key: TypeFilter; label: string; color: string }[] = [
  { key: 'todos', label: 'Todos', color: colors.teal },
  { key: 'hibrido', label: 'Híbridos', color: colors.teal },
  { key: 'enchufable', label: 'Enchufables', color: colors.blue },
  { key: 'electrico', label: 'Eléctricos', color: colors.violet },
  { key: 'usados', label: 'Solo usados', color: colors.amber },
  { key: 'favoritos', label: 'Favoritos', color: colors.pink },
];

const priceFilters: { key: PriceFilter; label: string }[] = [
  { key: 'todos', label: 'Cualquier precio' },
  { key: 'hasta120', label: 'Hasta $120 M' },
  { key: '120a200', label: '$120 – $200 M' },
  { key: 'mas200', label: 'Más de $200 M' },
];

const sorts: { key: Sort; label: string }[] = [
  { key: 'relevancia', label: 'Destacados' },
  { key: 'precio', label: 'Menor precio' },
  { key: 'eficiencia', label: 'Más eficiente' },
  { key: 'potencia', label: 'Más potencia' },
];

/** Métrica comparable de eficiencia: costo energético por km (menor es mejor). */
function efficiencyScore(v: Vehicle) {
  if (v.powertrain === 'electrico') return 0.15 * 1000;
  if (v.powertrain === 'enchufable') return 15800 / 3.785 / (v.kmPerL ?? 15) / 2.5;
  return 15800 / 3.785 / (v.kmPerL ?? 15);
}

export default function Catalogo() {
  const { favoriteVehicles } = useStore();
  const [type, setType] = useState<TypeFilter>('todos');
  const [price, setPrice] = useState<PriceFilter>('todos');
  const [sort, setSort] = useState<Sort>('relevancia');
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const out = vehicles.filter((v) => {
      if (type === 'hibrido' && !(v.powertrain === 'hibrido' || v.powertrain === 'mild')) return false;
      if (type === 'enchufable' && v.powertrain !== 'enchufable') return false;
      if (type === 'electrico' && v.powertrain !== 'electrico') return false;
      if (type === 'usados' && !v.used) return false;
      if (type === 'favoritos' && !favoriteVehicles.includes(v.id)) return false;
      if (price === 'hasta120' && v.priceM > 120) return false;
      if (price === '120a200' && (v.priceM < 120 || v.priceM > 200)) return false;
      if (price === 'mas200' && v.priceM <= 200) return false;
      if (q && !`${v.brand} ${v.model} ${v.tagline}`.toLowerCase().includes(q)) return false;
      return true;
    });
    if (sort === 'precio') out.sort((a, b) => a.priceM - b.priceM);
    if (sort === 'potencia') out.sort((a, b) => b.hp - a.hp);
    if (sort === 'eficiencia') out.sort((a, b) => efficiencyScore(a) - efficiencyScore(b));
    if (sort === 'relevancia') out.sort((a, b) => Number(!!b.popular) - Number(!!a.popular));
    return out;
  }, [type, price, sort, query, favoriteVehicles]);

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.violet} />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <SectionHeader
          index="03"
          label="Catálogo"
          title="Híbridos y eléctricos"
          highlight="que sí están en Bogotá"
          gradient={[colors.blue, colors.violet, colors.pink]}
          subtitle="Nuevos y usados, con lo que importa en esta ciudad: autonomía real, consumo en tráfico y precio de entrada."
        />

        <View style={styles.search}>
          <Icon name="search" size={18} color={colors.muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Busca marca o modelo"
            placeholderTextColor={colors.faint}
            selectionColor={colors.teal}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {query ? (
            <PressableScale onPress={() => setQuery('')} accessibilityLabel="Borrar búsqueda">
              <Icon name="x-circle" size={18} color={colors.muted} />
            </PressableScale>
          ) : null}
        </View>

        <Card style={styles.filters}>
          <View style={styles.filterRow}>
            <View style={styles.filterLabel}>
              <Icon name="sliders" size={16} color={colors.muted} />
              <AppText variant="mono" style={{ letterSpacing: 3 }}>
                FILTRAR
              </AppText>
            </View>
            {typeFilters.map((f) => (
              <Chip
                key={f.key}
                label={f.label}
                color={f.color}
                icon={f.key === 'favoritos' ? 'heart' : undefined}
                count={f.key === 'favoritos' ? favoriteVehicles.length : undefined}
                selected={type === f.key}
                onPress={() => setType(f.key)}
              />
            ))}
          </View>
          <View style={styles.sep} />
          <View style={styles.filterRow}>
            {priceFilters.map((f) => (
              <Chip key={f.key} label={f.label} color={colors.blue} selected={price === f.key} onPress={() => setPrice(f.key)} />
            ))}
          </View>
          <View style={styles.sep} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {sorts.map((s) => (
              <Chip
                key={s.key}
                size="sm"
                label={s.label}
                icon={sort === s.key ? 'check' : undefined}
                color={colors.amber}
                selected={sort === s.key}
                onPress={() => setSort(s.key)}
              />
            ))}
          </ScrollView>
          <Animated.View key={list.length} entering={FadeIn} style={{ marginTop: 14 }}>
            <AppText variant="mono">{list.length === 1 ? '1 modelo' : `${list.length} modelos`}</AppText>
          </Animated.View>
        </Card>

        <View style={{ gap: 18, marginTop: 18 }}>
          {list.map((v, i) => (
            <Animated.View
              key={v.id}
              entering={FadeInDown.delay(Math.min(i, 4) * 80).duration(450)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.springify().damping(18)}
            >
              <VehicleCard v={v} />
            </Animated.View>
          ))}
          {list.length === 0 && (
            <Animated.View entering={FadeInDown}>
              <Card style={{ alignItems: 'center', gap: 10, paddingVertical: 40 }}>
                <Icon name={type === 'favoritos' ? 'heart' : 'search'} size={30} color={colors.muted} />
                <AppText variant="h3" center>
                  {type === 'favoritos' ? 'Aún no tienes favoritos' : 'Sin resultados'}
                </AppText>
                <AppText variant="body" center>
                  {type === 'favoritos'
                    ? 'Toca el corazón de un vehículo para guardarlo aquí.'
                    : 'Prueba con otro filtro o rango de precio.'}
                </AppText>
              </Card>
            </Animated.View>
          )}
        </View>

        <AppText variant="small" style={{ marginTop: 24, color: colors.faint, lineHeight: 20 }}>
          Precios de referencia del mercado colombiano en millones de pesos. El valor vigente, el color y el equipamiento los confirmamos
          con el vendedor cuando te conectamos. *Verifica la normativa vigente de pico y placa.
        </AppText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 16, outlineWidth: 0 },
  filters: { padding: 18 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' },
  filterLabel: { flexDirection: 'row', gap: 8, alignItems: 'center', marginRight: 4 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 16 },
});
