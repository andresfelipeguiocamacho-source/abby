import { useState } from 'react';
import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition, useAnimatedStyle, useDerivedValue, withSpring } from 'react-native-reanimated';

import { AppHeader, AppText, Backdrop, Button, Icon, PressableScale, SectionHeader } from '@/components/ui';
import { faqs } from '@/data/content';
import { whatsappUrl } from '@/lib/config';
import { alpha, colors, fonts } from '@/lib/theme';

const numColors = [colors.teal, colors.blue, colors.violet, colors.pink, colors.amber];

function Item({ i, q, a, open, onToggle }: { i: number; q: string; a: string; open: boolean; onToggle: () => void }) {
  const r = useDerivedValue(() => withSpring(open ? 1 : 0, { damping: 14 }), [open]);
  const icon = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 45}deg` }] }));
  const c = numColors[i % numColors.length];
  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      style={[styles.item, open && { borderColor: alpha(colors.blue, 0.5), backgroundColor: '#0B1020' }]}
    >
      <PressableScale
        onPress={onToggle}
        scaleTo={0.99}
        style={styles.head}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
      >
        <View style={[styles.num, open && { backgroundColor: colors.blue }]}>
          <AppText style={{ fontFamily: fonts.monoBold, color: open ? colors.text : c, fontSize: 14 }}>
            {String(i + 1).padStart(2, '0')}
          </AppText>
        </View>
        <AppText variant="title" style={{ flex: 1, fontSize: 17, lineHeight: 23 }}>
          {q}
        </AppText>
        <Animated.View style={[styles.toggle, open && { backgroundColor: colors.blue, borderColor: colors.blue }, icon]}>
          <Icon name="plus" size={20} color={colors.text} />
        </Animated.View>
      </PressableScale>
      {open && (
        <Animated.View entering={FadeIn.duration(250)} style={styles.body}>
          <AppText variant="body" style={{ fontSize: 16, lineHeight: 26 }}>
            {a}
          </AppText>
        </Animated.View>
      )}
    </Animated.View>
  );
}

export default function Faq() {
  const [open, setOpen] = useState<number | null>(1);
  return (
    <View style={{ flex: 1 }}>
      <Backdrop tint={colors.violet} />
      <AppHeader back title="Dudas" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <SectionHeader
          index="12"
          label="Dudas"
          title="Preguntas"
          highlight="frecuentes"
          gradient={[colors.violet, colors.pink]}
          subtitle="Si no está aquí, escríbenos: respondemos incluso cuando la respuesta es «todavía no»."
        />
        <Animated.View entering={FadeInDown}>
          <Button
            label="Preguntar por WhatsApp"
            icon="message-circle"
            onPress={() => Linking.openURL(whatsappUrl('Hola AMPERIA, tengo una pregunta.'))}
            style={{ marginBottom: 20 }}
          />
        </Animated.View>
        <View style={{ gap: 12 }}>
          {faqs.map((f, i) => (
            <Item key={f.q} i={i} q={f.q} a={f.a} open={open === i} onToggle={() => setOpen(open === i ? null : i)} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  item: { borderRadius: 28, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  num: { width: 42, height: 42, borderRadius: 21, backgroundColor: colors.surface3, alignItems: 'center', justifyContent: 'center' },
  toggle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { paddingLeft: 76, paddingRight: 22, paddingBottom: 22 },
});
