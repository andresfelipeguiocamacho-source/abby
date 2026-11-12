import { forwardRef, useState, type ComponentRef } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Animated, { FadeIn, interpolateColor, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { colors, fonts, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';
import { AppText } from './Text';

type Props = TextInputProps & { label: string; error?: string | null; icon?: IconName; right?: React.ReactNode; hint?: string };

/** Campo de texto con borde que se ilumina al enfocarlo y mensaje de error animado. */
export const Field = forwardRef<ComponentRef<typeof TextInput>, Props>(function Field(
  { label, error, icon, right, hint, style, ...rest },
  ref,
) {
  const [focused, setFocused] = useState(false);
  const f = useDerivedValue(() => withTiming(focused ? 1 : 0, { duration: 180 }), [focused]);
  const border = useAnimatedStyle(() => ({
    borderColor: error ? colors.red : interpolateColor(f.value, [0, 1], [colors.border, colors.teal]),
    backgroundColor: interpolateColor(f.value, [0, 1], ['#070A11', '#0A1016']),
  }));

  return (
    <View style={styles.wrap}>
      <AppText variant="bodyStrong" style={styles.label}>
        {label}
      </AppText>
      <Animated.View style={[styles.box, border]}>
        {icon && <Icon name={icon} size={18} color={focused ? colors.teal : colors.faint} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.faint}
          selectionColor={colors.teal}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[styles.input, rest.multiline && styles.multiline, style]}
        />
        {right}
      </Animated.View>
      {error ? (
        <Animated.View entering={FadeIn.duration(180)} style={styles.errorRow}>
          <Icon name="alert-circle" size={14} color={colors.red} />
          <AppText variant="small" color={colors.red}>
            {error}
          </AppText>
        </Animated.View>
      ) : hint ? (
        <AppText variant="small" style={{ color: colors.faint }}>
          {hint}
        </AppText>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: { gap: 8, marginBottom: 16 },
  label: { color: colors.text },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    minHeight: 58,
  },
  input: { flex: 1, color: colors.text, fontFamily: fonts.regular, fontSize: 16, paddingVertical: 16, outlineWidth: 0 },
  multiline: { minHeight: 110, textAlignVertical: 'top' },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
