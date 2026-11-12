import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MemberCard } from '@/components/MemberCard';
import { ProductCard } from '@/components/ProductCard';
import { AnimatedNumber, AppHeader, AppText, Backdrop, Button, Card, Chip, Icon, PressableScale, SectionHeader } from '@/components/ui';
import { products, type ProductCategory } from '@/data/products';
import { useAuth } from '@/lib/auth';
import { formatCOP } from '@/lib/format';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { accentGradient, alpha, colors, fonts } from '@/lib/theme';

type Section = 'cargadores' | 'servicios' | 'accesorios' | 'socio' | 'recargas';

const sections: { key: Section; label: string; cats: ProductCategory[]; color: string }[] = [
  { key: 'cargadores', label: 'Cargadores', cats: ['cargador'], color: colors.teal },
  { key: 'servicios', label: 'Instalación', cats: ['servicio'], color: colors.amber },
  { key: 'accesorios', label: 'Accesorios', cats: ['accesorio'], color: colors.blue },
  { key: 'socio', label: 'Socio', cats: ['membresia'], color: colors.pink },
  { key: 'recargas', label: 'Recargas', cats: ['recarga'], color: colors.violet },
];

export default function Tienda() {
  const params = useLocalSearchParams<{ seccion?: Section }>();
  const [section, setSection] = useState<Section>(params.seccion ?? 'cargadores');
  const { wallet, addToCart } = useStore();
  const { user } = useAuth();

  useEffect(() => {
    if (params.seccion) setSection(params.seccion);
  }, [params.seccion]);

  const current = sections.find((s) => s.key === section)!;
  const list = products.filter((p) => current.cats.includes(p.category));

  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={current.color} />
      <AppHeader />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} stickyHeaderIndices={[1]}>
        <SectionHeader
          index="04"
          label="Tienda AMPERIA"
          title="Carga en casa por"
          highlight="una fracción del galón"
          gradient={[colors.teal, colors.blue, colors.violet]}
          subtitle="El cargador correcto depende de tu acometida, no del catálogo. Lo elegimos contigo, lo instalamos certificado y pagas aquí mismo."
        />
        <View style={styles.sticky}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingVertical: 12 }}>
            {sections.map((s) => (
              <Chip
                key={s.key}
                label={s.label}
                color={s.color}
                selected={section === s.key}
                onPress={() => {
                  haptic.tap();
                  setSection(s.key);
                }}
              />
            ))}
          </ScrollView>
        </View>

        <Animated.View key={section} entering={FadeInDown.duration(400)} style={{ gap: 18, marginTop: 8 }}>
          {section === 'socio' && <MemberCard name={user?.name} />}

          {section === 'recargas' && (
            <Card padded={false} style={styles.wallet}>
              <LinearGradient
                colors={[alpha(colors.violet, 0.4), alpha(colors.blue, 0.15)]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Icon name="mci:wallet-outline" size={20} color={colors.text} />
                <AppText variant="label" color={colors.text}>
                  Tu saldo AMPERIA
                </AppText>
              </View>
              <AnimatedNumber value={wallet} prefix="$" variant="display" style={{ marginTop: 12 }} />
              <AppText variant="body" style={{ color: colors.textSoft }}>
                Úsalo en cualquiera de las 9 estaciones. Sin vencimiento.
              </AppText>
            </Card>
          )}

          {section === 'recargas' ? (
            <View style={styles.packs}>
              {list.map((p, i) => {
                const c = accentGradient[p.accent][0];
                return (
                  <Animated.View key={p.id} entering={FadeInDown.delay(i * 80)} style={{ flexGrow: 1, flexBasis: '30%' }}>
                    <PressableScale
                      onPress={() => {
                        addToCart({
                          kind: 'producto',
                          refId: p.id,
                          name: p.name,
                          subtitle: p.subtitle,
                          unitPrice: p.price,
                          accent: p.accent,
                          walletCredit: p.walletCredit,
                        });
                        haptic.success();
                        router.push('/carrito');
                      }}
                      style={[styles.pack, { borderColor: alpha(c, 0.45) }]}
                    >
                      {p.badge ? (
                        <View style={[styles.packBadge, { backgroundColor: c }]}>
                          <AppText style={{ fontFamily: fonts.monoBold, fontSize: 11, color: colors.onAccent }}>{p.badge}</AppText>
                        </View>
                      ) : null}
                      <AppText variant="mono" style={{ letterSpacing: 2 }}>
                        PAGAS
                      </AppText>
                      <AppText variant="h3">{formatCOP(p.price)}</AppText>
                      <AppText variant="mono" style={{ letterSpacing: 2, marginTop: 10 }}>
                        RECIBES
                      </AppText>
                      <AppText variant="title" color={c}>
                        {formatCOP(p.walletCredit ?? p.price)}
                      </AppText>
                    </PressableScale>
                  </Animated.View>
                );
              })}
            </View>
          ) : (
            list.map((p, i) => (
              <Animated.View key={p.id} entering={FadeInDown.delay(i * 90).duration(450)}>
                <ProductCard p={p} />
              </Animated.View>
            ))
          )}

          {section === 'cargadores' && (
            <Card accent="amber" style={{ gap: 12 }}>
              <AppText variant="label" color={colors.amber}>
                Antes de comprar
              </AppText>
              <AppText variant="h3">Medimos tu acometida gratis por videollamada</AppText>
              <AppText variant="body">
                Si tu instalación no aguanta la potencia del cargador, te lo decimos y te proponemos una alternativa más barata.
              </AppText>
              <Button
                label="Agendar revisión"
                variant="outline"
                icon="video"
                onPress={() => router.push({ pathname: '/cotizacion', params: { tipo: 'cargador' } })}
              />
            </Card>
          )}
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: 40 },
  sticky: { backgroundColor: colors.bg, marginHorizontal: -20, paddingHorizontal: 20 },
  wallet: { padding: 24, borderColor: alpha(colors.violet, 0.4) },
  packs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pack: { padding: 18, borderRadius: 24, borderWidth: 1, backgroundColor: colors.surface, gap: 2, minHeight: 150 },
  packBadge: { position: 'absolute', top: 12, right: 12, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
});
