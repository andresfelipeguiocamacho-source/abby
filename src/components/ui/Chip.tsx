import { StyleSheet, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { alpha, colors, fonts, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { AppText } from './Text';

/** Chip seleccionable con transición de color. */
export function Chip({
  label,
  selected = false,
  onPress,
  color = colors.teal,
  icon,
  count,
  size = 'md',
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  icon?: IconName;
  count?: number;
  size?: 'sm' | 'md';
}) {
  const p = useDerivedValue(() => withTiming(selected ? 1 : 0, { duration: 220 }), [selected]);
  const style = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(p.value, [0, 1], ['rgba(255,255,255,0.02)', alpha(color, 0.12)]),
    borderColor: interpolateColor(p.value, [0, 1], [colors.border, color]),
  }));
  return (
    <PressableScale onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}>
      <Animated.View
        style={[
          styles.chip,
          size === 'sm' && styles.sm,
          style,
          selected && { shadowColor: color, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
        ]}
      >
        {icon && <Icon name={icon} size={15} color={selected ? color : colors.textSoft} />}
        <AppText style={[styles.label, size === 'sm' && { fontSize: 13 }, { color: selected ? color : colors.textSoft }]}>{label}</AppText>
        {count !== undefined && (
          <View style={[styles.count, { backgroundColor: selected ? color : colors.surface3 }]}>
            <AppText style={[styles.countText, { color: selected ? colors.onAccent : colors.muted }]}>{count}</AppText>
          </View>
        )}
      </Animated.View>
    </PressableScale>
  );
}

/** Etiqueta estática (p. ej. "HÍBRIDO", "7 kW · monofásico"). */
export function Tag({
  label,
  color = colors.teal,
  solid,
  mono = true,
}: {
  label: string;
  color?: string;
  solid?: boolean;
  mono?: boolean;
}) {
  return (
    <View style={[styles.tag, { borderColor: solid ? color : alpha(color, 0.5), backgroundColor: solid ? color : alpha(color, 0.1) }]}>
      <AppText
        style={{
          fontFamily: mono ? fonts.monoBold : fonts.semibold,
          fontSize: mono ? 11 : 13,
          letterSpacing: mono ? 2 : 0,
          textTransform: mono ? 'uppercase' : 'none',
          color: solid ? colors.onAccent : color,
        }}
      >
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    height: 44,
  },
  sm: { height: 36, paddingHorizontal: 14 },
  label: { fontFamily: fonts.semibold, fontSize: 14 },
  count: { minWidth: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  countText: { fontFamily: fonts.monoBold, fontSize: 11 },
  tag: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 6 },
});
