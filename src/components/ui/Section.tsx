import { StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { colors, gradients } from '@/lib/theme';
import { AppText, GradientText } from './Text';

/** Encabezado de sección: "02 — EMPIEZA AQUÍ" + título con palabra en degradado. */
export function SectionHeader({
  index,
  label,
  title,
  highlight,
  subtitle,
  gradient = gradients.primary,
  right,
}: {
  index?: string;
  label: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  gradient?: readonly [string, string, ...string[]];
  right?: React.ReactNode;
}) {
  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.wrap}>
      <View style={styles.labelRow}>
        <AppText variant="label">{index ? `${index} — ${label}` : label}</AppText>
        {right}
      </View>
      <AppText variant="h1">
        {title}
        {highlight ? ' ' : ''}
      </AppText>
      {highlight ? (
        <View style={styles.highlight}>
          <GradientText variant="h1" colors={gradient}>
            {highlight}
          </GradientText>
        </View>
      ) : null}
      {subtitle ? (
        <AppText variant="body" style={styles.subtitle}>
          {subtitle}
        </AppText>
      ) : null}
    </Animated.View>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  wrap: { gap: 6, marginBottom: 22 },
  labelRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  highlight: { marginTop: -4 },
  subtitle: { marginTop: 10, fontSize: 16, lineHeight: 25 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 18 },
});
