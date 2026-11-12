import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import type { Product } from '@/data/products';
import { formatCOP } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { accentGradient, alpha, colors, fonts } from '@/lib/theme';
import { AppText, Button, Card, Icon, IconBox, Tag, useToast, type IconName } from './ui';

const iconFor: Record<Product['icon'], IconName> = {
  plug: 'mci:power-plug-outline',
  zap: 'zap',
  home: 'mci:ev-plug-type2',
  building: 'mci:ev-station',
  shield: 'shield',
  cable: 'mci:cable-data',
  battery: 'mci:battery-charging-high',
  card: 'credit-card',
  gift: 'gift',
  tool: 'tool',
};

export function ProductCard({ p, compact }: { p: Product; compact?: boolean }) {
  const { addToCart, cart } = useStore();
  const toast = useToast();
  const color = accentGradient[p.accent][0];
  const inCart = cart.find((c) => c.refId === p.id)?.qty ?? 0;

  const add = () => {
    addToCart({
      kind: 'producto',
      refId: p.id,
      name: p.name,
      subtitle: p.subtitle,
      unitPrice: p.price,
      accent: p.accent,
      walletCredit: p.walletCredit,
      maxQty: p.category === 'membresia' ? 1 : 10,
    });
    haptic.success();
    toast({
      title: 'Agregado al carrito',
      body: p.name,
      icon: 'shopping-bag',
      action: { label: 'Ver', onPress: () => router.push('/carrito') },
    });
  };

  if (compact) {
    return (
      <Card accent={p.accent} style={styles.compact}>
        {p.badge ? <Tag label={p.badge} color={color} /> : <View style={{ height: 26 }} />}
        <AppText variant="h3" style={{ marginTop: 14 }}>
          {p.name}
        </AppText>
        <AppText variant="small" style={{ marginTop: 4 }}>
          {p.subtitle}
        </AppText>
        <View style={{ flex: 1 }} />
        <Button
          label={inCart ? `En carrito (${inCart})` : 'Comprar'}
          size="md"
          variant={inCart ? 'soft' : 'primary'}
          onPress={add}
          style={{ marginTop: 16 }}
        />
      </Card>
    );
  }

  return (
    <Card accent={p.accent} intensity={0.18}>
      <View style={styles.top}>
        <IconBox icon={iconFor[p.icon]} accent={p.accent} size={60} />
        {p.badge && <Tag label={p.badge} color={p.badge === 'Próximamente' ? colors.amber : color} />}
      </View>
      <AppText variant="h2" style={{ marginTop: 18 }}>
        {p.name}
      </AppText>
      <AppText variant="body" style={{ marginTop: 6 }}>
        {p.subtitle}
      </AppText>
      {p.chips.length > 0 && (
        <View style={styles.chips}>
          {p.chips.map((c) => (
            <View key={c} style={styles.chip}>
              <AppText style={{ fontFamily: fonts.semibold, color: colors.textSoft, fontSize: 14 }}>{c}</AppText>
            </View>
          ))}
        </View>
      )}
      {p.features.length > 0 && (
        <>
          <View style={styles.sep} />
          <View style={{ gap: 12 }}>
            {p.features.map((f) => (
              <View key={f} style={styles.feature}>
                <Icon name="check" size={18} color={colors.teal} />
                <AppText variant="body" style={{ color: colors.textSoft, flex: 1, fontSize: 16 }}>
                  {f}
                </AppText>
              </View>
            ))}
          </View>
        </>
      )}
      <AppText variant="mono" style={{ letterSpacing: 3, marginTop: 24 }}>
        {p.priceSuffix === 'desde' ? 'DESDE' : p.category === 'cargador' ? 'EQUIPO DESDE' : 'PRECIO'}
      </AppText>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <AppText variant="price" style={{ fontSize: 36, lineHeight: 42 }}>
          {formatCOP(p.price)}
        </AppText>
        {p.priceSuffix && p.priceSuffix !== 'desde' ? (
          <AppText variant="body" style={{ marginBottom: 6 }}>
            {p.priceSuffix}
          </AppText>
        ) : null}
      </View>
      <View style={{ gap: 10, marginTop: 18 }}>
        <Button
          label={inCart ? `Agregar otro (${inCart} en carrito)` : p.category === 'membresia' ? 'Reservar mi cupo' : 'Agregar al carrito'}
          icon={inCart ? 'plus' : 'shopping-bag'}
          variant={p.category === 'membresia' ? 'warm' : 'primary'}
          onPress={add}
        />
        {p.category === 'cargador' && (
          <Button
            label="¿Mi instalación lo soporta?"
            variant="outline"
            icon="help-circle"
            onPress={() => router.push({ pathname: '/cotizacion', params: { tipo: 'cargador', producto: p.id } })}
          />
        )}
      </View>
      {p.category === 'membresia' && (
        <View style={[styles.note, { borderColor: alpha(colors.amber, 0.35) }]}>
          <Icon name="info" size={16} color={colors.amber} />
          <AppText variant="small" style={{ flex: 1, color: colors.textSoft }}>
            Hoy sólo reservas tu cupo. El primer cobro se hace el día del lanzamiento.
          </AppText>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 18 },
  chip: { borderWidth: 1, borderColor: colors.borderStrong, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  sep: { height: 1, backgroundColor: colors.border, marginVertical: 20 },
  feature: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  compact: { width: 220, padding: 18 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'center', marginTop: 16, borderWidth: 1, borderRadius: 16, padding: 12 },
});
