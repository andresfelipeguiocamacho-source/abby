import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { useEffect } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { HeroStage } from '@/components/HeroStage';
import { InteractiveCar } from '@/components/InteractiveCar';
import { MemberCard } from '@/components/MemberCard';
import { VehicleCard } from '@/components/VehicleCard';
import {
  AnimatedNumber,
  AppHeader,
  AppText,
  Backdrop,
  Button,
  Card,
  GradientText,
  Icon,
  IconBox,
  PressableScale,
  SectionHeader,
  Tag,
} from '@/components/ui';
import { reasons, services, stats, steps } from '@/data/content';
import { vehicles } from '@/data/vehicles';
import { useAuth } from '@/lib/auth';
import { whatsappUrl } from '@/lib/config';
import { accentGradient, alpha, colors, fonts, gradients } from '@/lib/theme';

const ticker = [
  'Ahorro real en trancón',
  'Pico y placa resuelto',
  'Electrolinera en tu ruta',
  'Repuesto que sí existe',
  'Instalación RETIE',
];

function Ticker() {
  const x = useSharedValue(0);
  useEffect(() => {
    x.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.linear }), -1, false);
  }, [x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: -x.value * 900 }] }));
  const items = [...ticker, ...ticker, ...ticker];
  const dots = [colors.teal, colors.blue, colors.violet, colors.pink, colors.amber];
  return (
    <View style={styles.ticker}>
      <Animated.View style={[styles.tickerRow, style]}>
        {items.map((t, i) => (
          <View key={i} style={styles.tickerItem}>
            <View style={[styles.tickerDot, { backgroundColor: dots[i % dots.length] }]} />
            <AppText variant="mono" style={{ letterSpacing: 3, color: colors.textSoft }}>
              {t.toUpperCase()}
            </AppText>
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

export default function Inicio() {
  const { user } = useAuth();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollY.value = e.contentOffset.y;
  });
  const heroParallax = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [0, 400], [0, 80], 'clamp') }],
    opacity: interpolate(scrollY.value, [0, 380], [1, 0.3], 'clamp'),
  }));

  const featured = vehicles.filter((v) => v.popular);

  return (
    <View style={{ flex: 1 }}>
      <Backdrop />
      <AppHeader />
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <Animated.View style={heroParallax}>
          <Animated.View entering={FadeInDown.duration(600)} style={styles.kicker}>
            <Icon name="zap" size={16} color={colors.teal} />
            <AppText variant="label" style={{ letterSpacing: 2.6 }}>
              {user ? `Hola, ${user.name.split(' ')[0]}` : 'Híbridos y eléctricos en Bogotá'}
            </AppText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(100).duration(700)}>
            <AppText variant="display" style={{ marginTop: 22 }}>
              Tu híbrido o eléctrico,
            </AppText>
            <GradientText variant="display" colors={[colors.blue, colors.violet]}>
              resuelto.
            </GradientText>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(200).duration(700)}>
            <AppText variant="body" style={styles.lead}>
              Te conectamos con el carro, instalamos el cargador, conseguimos el repuesto y operamos nuestra propia red de estaciones en
              Bogotá.
            </AppText>
            <View style={styles.idealRow}>
              <AppText variant="mono" style={{ letterSpacing: 3 }}>
                IDEAL SI ESTÁS:
              </AppText>
              <Tag label="comprando" color={colors.teal} mono={false} />
              <Tag label="buscando repuesto" color={colors.violet} mono={false} />
              <Tag label="armando tu ruta" color={colors.amber} mono={false} />
            </View>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300).duration(700)} style={{ gap: 12, marginTop: 26 }}>
            <Button label="Cuéntame qué buscas" iconRight="arrow-right" shimmer onPress={() => router.push('/cotizacion')} />
            <Button
              label="WhatsApp"
              icon="message-circle"
              variant="outline"
              onPress={() => Linking.openURL(whatsappUrl('Hola AMPERIA, quiero información.'))}
            />
          </Animated.View>
        </Animated.View>

        {/* STATS */}
        <View style={{ gap: 12, marginTop: 30 }}>
          {stats.map((s, i) => (
            <Animated.View key={s.label} entering={FadeInRight.delay(350 + i * 120).duration(600)}>
              <Card style={styles.statCard} padded={false} accent={s.accent} intensity={0.1}>
                <AnimatedNumber
                  value={s.value}
                  prefix={s.prefix}
                  suffix={s.suffix}
                  duration={1400}
                  variant="h2"
                  color={accentGradient[s.accent][0]}
                  style={{ fontFamily: fonts.monoBold }}
                />
                <AppText variant="body" style={{ color: colors.textSoft }}>
                  {s.label}
                </AppText>
              </Card>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.delay(500).duration(700)} style={{ marginTop: 18 }}>
          <HeroStage />
          <View style={styles.heroBadge}>
            <Icon name="map-pin" size={16} color={colors.teal} />
            <View>
              <AppText variant="label">Bogotá</AppText>
              <AppText variant="title">Conectamos, no vendemos humo</AppText>
            </View>
          </View>
        </Animated.View>

        <Ticker />
        <HomeSections featured={featured} />
      </Animated.ScrollView>
    </View>
  );
}

/** Secciones del inicio debajo del hero. */
function HomeSections({ featured }: { featured: typeof vehicles }) {
  return (
    <>
      {/* SERVICIOS */}
      <View style={styles.section}>
        <SectionHeader
          index="02"
          label="Empieza aquí"
          title="¿Qué estás"
          highlight="buscando?"
          gradient={[colors.teal, colors.blue, colors.violet]}
          subtitle="Seis caminos. En todos te damos un contacto con contexto, no un enlace."
        />
        <View style={{ gap: 14 }}>
          {services.map((s, i) => (
            <Animated.View key={s.key} entering={FadeInDown.delay(i * 70).duration(500)}>
              <PressableScale onPress={() => router.push(s.href as Href)} scaleTo={0.98}>
                <Card accent={s.accent} style={{ gap: 14 }}>
                  <IconBox icon={s.icon} accent={s.accent} size={60} />
                  <AppText variant="h3">{s.title}</AppText>
                  <AppText variant="body">{s.body}</AppText>
                  <View style={styles.cta}>
                    <AppText style={{ fontFamily: fonts.bold, color: accentGradient[s.accent][0], fontSize: 16 }}>{s.cta}</AppText>
                    <Icon name="arrow-up-right" size={18} color={accentGradient[s.accent][0]} />
                  </View>
                </Card>
              </PressableScale>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* DESTACADOS */}
      <View style={styles.section}>
        <SectionHeader
          index="03"
          label="Catálogo"
          title="Híbridos y eléctricos"
          highlight="que sí están en Bogotá"
          gradient={[colors.blue, colors.violet, colors.pink]}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 14, paddingRight: 20 }}
          style={{ marginHorizontal: -20 }}
        >
          <View style={{ width: 6 }} />
          {featured.map((v) => (
            <VehicleCard key={v.id} v={v} compact />
          ))}
        </ScrollView>
        <Button
          label={`Ver los ${vehicles.length} modelos`}
          variant="soft"
          iconRight="arrow-up-right"
          style={{ marginTop: 18 }}
          onPress={() => router.push('/catalogo')}
        />
      </View>

      {/* CALCULADORA */}
      <View style={styles.section}>
        <Card accent="teal" intensity={0.22} style={{ gap: 14 }}>
          <AppText variant="label">10 — Criterio</AppText>
          <AppText variant="h2">
            Nació de una investigación real sobre cuánto ahorra un híbrido en el tráfico de Bogotá, no de fichas de laboratorio.
          </AppText>
          <GradientText variant="h3" colors={[colors.teal, colors.blue, colors.violet]}>
            Y hoy aplicamos ese mismo criterio a los eléctricos.
          </GradientText>
          <Button
            label="Abre la calculadora de ahorro"
            icon="mci:calculator-variant-outline"
            variant="soft"
            onPress={() => router.push('/calculadora')}
          />
        </Card>
      </View>

      {/* TOCA EL CARRO */}
      <View style={styles.section}>
        <SectionHeader
          index="09"
          label="Interactivo"
          title="Toca el carro y"
          highlight="descubre cómo funciona"
          subtitle="Cada parte ahorra distinto. Toca un punto y te lo explicamos en una línea."
        />
        <InteractiveCar />
      </View>

      {/* RAZONES */}
      <View style={styles.section}>
        <SectionHeader index="07" label="Por qué nos escriben" title="Cuatro razones simples" />
        <View style={{ gap: 14 }}>
          {reasons.map((r, i) => (
            <Animated.View key={r.title} entering={FadeInDown.delay(i * 80)}>
              <View style={[styles.reason, { shadowColor: accentGradient[r.accent][0] }]}>
                <LinearGradient
                  colors={accentGradient[r.accent]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View style={styles.reasonIcon}>
                  <Icon name={r.icon} size={26} color={colors.onAccent} />
                </View>
                <AppText variant="h3" color={colors.onAccent} style={{ marginTop: 18 }}>
                  {r.title}
                </AppText>
                <AppText style={{ fontFamily: fonts.medium, color: 'rgba(4,17,15,0.8)', marginTop: 4, fontSize: 15 }}>{r.body}</AppText>
                <AppText style={styles.reasonNum}>{String(i + 1).padStart(2, '0')}</AppText>
              </View>
            </Animated.View>
          ))}
        </View>
      </View>

      {/* PROCESO */}
      <View style={styles.section}>
        <View style={styles.process}>
          <LinearGradient
            colors={[colors.blue, colors.violet]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <AppText variant="label" color="rgba(255,255,255,0.8)">
            08 — Proceso
          </AppText>
          <AppText variant="h1" style={{ marginTop: 12 }}>
            Tres pasos y ya estás hablando con alguien
          </AppText>
          <View style={{ gap: 14, marginTop: 24 }}>
            {steps.map((s, i) => (
              <Animated.View key={s.title} entering={FadeInDown.delay(i * 120)} style={[styles.step, i === 0 && styles.stepActive]}>
                <View style={styles.stepTop}>
                  <View style={[styles.stepNum, i === 0 && { backgroundColor: colors.teal }]}>
                    <AppText
                      style={{ fontFamily: fonts.extrabold, fontSize: 20, color: i === 0 ? colors.onAccent : '#1E1B4B' }}
                    >{`0${i + 1}`}</AppText>
                  </View>
                  <AppText variant="mono" style={{ letterSpacing: 3, color: 'rgba(255,255,255,0.7)' }}>
                    {i === 0 ? 'AHORA' : `PASO ${i + 1}`}
                  </AppText>
                </View>
                <AppText variant="h3" style={{ marginTop: 18 }}>
                  {s.title}
                </AppText>
                <AppText variant="body" style={{ color: 'rgba(255,255,255,0.72)', marginTop: 6 }}>
                  {s.body}
                </AppText>
              </Animated.View>
            ))}
          </View>
          <Button label="Empezar ahora" variant="dark" style={{ marginTop: 22 }} onPress={() => router.push('/cotizacion')} />
        </View>
      </View>

      {/* MEMBRESÍA */}
      <View style={styles.section}>
        <SectionHeader
          index="11"
          label="Membresía"
          title="Tu tarjeta de"
          highlight="beneficios"
          gradient={[colors.blue, colors.violet, colors.pink]}
          subtitle="Recargas más baratas, refacciones sin drama y alguien al otro lado que sabe de qué habla."
          right={<Tag label="Próximamente" color={colors.amber} />}
        />
        <MemberCard />
        <Card style={{ marginTop: 16, gap: 14 }}>
          <AppText variant="body" style={{ fontSize: 16 }}>
            Los primeros entran con <AppText style={{ fontFamily: fonts.bold, color: colors.text }}>precio preferencial</AppText>.
          </AppText>
          <Button label="Quiero ser de los primeros" variant="warm" iconRight="arrow-right" onPress={() => router.push('/tienda')} />
        </Card>
      </View>

      {/* CONTACTO */}
      <View style={[styles.section, { marginBottom: 20 }]}>
        <Card accent="blue" style={{ gap: 14 }}>
          <AppText variant="label">13 — Escríbenos</AppText>
          <AppText variant="h2">
            Cuéntanos qué{' '}
            <AppText variant="h2" color={colors.blue}>
              necesitas
            </AppText>
          </AppText>
          <AppText variant="body">Un mensaje corto basta. Respondemos el mismo día hábil.</AppText>
          {[
            ['Te lee una persona, no un bot.', colors.teal],
            ['No cobramos por conectarte.', colors.blue],
            ['Si no podemos ayudarte, te lo decimos.', colors.pink],
          ].map(([t, c]) => (
            <View key={t} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Icon name="shield" size={18} color={c} />
              <AppText variant="bodyStrong">{t}</AppText>
            </View>
          ))}
          <Button label="Escribir ahora" iconRight="arrow-right" onPress={() => router.push('/cotizacion')} />
          <Button label="Preguntas frecuentes" variant="outline" icon="help-circle" onPress={() => router.push('/faq')} />
        </Card>
        <View style={styles.footerBars}>
          {[...gradients.spectrum, colors.amber].map((c) => (
            <View key={c} style={[styles.footerBar, { backgroundColor: c, shadowColor: c }]} />
          ))}
        </View>
        <AppText variant="small" center style={{ marginTop: 14, color: colors.faint }}>
          AMPERIA · Bogotá, Colombia
        </AppText>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 40 },
  kicker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: alpha(colors.teal, 0.4),
    backgroundColor: alpha(colors.teal, 0.06),
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  lead: { fontSize: 17, lineHeight: 27, marginTop: 20 },
  idealRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginTop: 22 },
  statCard: { padding: 20, gap: 6 },
  heroBadge: {
    position: 'absolute',
    left: 14,
    top: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(5,7,13,0.85)',
    borderRadius: 20,
    padding: 14,
    paddingRight: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ticker: {
    height: 54,
    marginHorizontal: -20,
    marginTop: 30,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  tickerRow: { flexDirection: 'row' },
  tickerItem: { flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 34 },
  tickerDot: { width: 8, height: 8, borderRadius: 4 },
  section: { marginTop: 56 },
  cta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 },
  reason: {
    borderRadius: 28,
    padding: 22,
    overflow: 'hidden',
    shadowOpacity: 0.35,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  reasonIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: 'rgba(4,17,15,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonNum: { position: 'absolute', right: 22, bottom: 18, fontFamily: fonts.monoBold, fontSize: 40, color: 'rgba(4,17,15,0.14)' },
  process: { borderRadius: 32, padding: 24, overflow: 'hidden' },
  step: { borderRadius: 26, padding: 20, backgroundColor: 'rgba(30,27,75,0.35)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  stepActive: { backgroundColor: '#0E1430' },
  stepTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepNum: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30,27,75,0.45)',
  },
  footerBars: { flexDirection: 'row', gap: 10, marginTop: 28, justifyContent: 'center' },
  footerBar: { width: 46, height: 8, borderRadius: 4, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 } },
});
