import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

import { colors, fonts, gradients, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { AppText } from './Text';

type Variant = 'primary' | 'warm' | 'outline' | 'ghost' | 'dark' | 'soft';

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  iconRight,
  loading,
  disabled,
  size = 'lg',
  shimmer,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  icon?: IconName;
  iconRight?: IconName;
  loading?: boolean;
  disabled?: boolean;
  size?: 'md' | 'lg';
  shimmer?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const height = size === 'lg' ? 58 : 46;
  const filled = variant === 'primary' || variant === 'warm';
  const fg = filled ? colors.onAccent : variant === 'soft' ? colors.teal : colors.text;

  const content = (
    <View style={[styles.row, { height }]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Icon name={icon} size={18} color={fg} />}
          <AppText style={[styles.label, { color: fg, fontSize: size === 'lg' ? 16 : 14 }]}>{label}</AppText>
          {iconRight && <Icon name={iconRight} size={18} color={fg} />}
        </>
      )}
    </View>
  );

  return (
    <PressableScale
      onPress={disabled || loading ? undefined : onPress}
      style={[
        styles.base,
        { borderRadius: radius.pill, opacity: disabled ? 0.45 : 1 },
        variant === 'outline' && styles.outline,
        variant === 'dark' && styles.dark,
        variant === 'soft' && styles.soft,
        filled && styles.glow,
        variant === 'warm' && { shadowColor: colors.pink },
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
    >
      {filled ? (
        <LinearGradient
          colors={variant === 'warm' ? gradients.warm : gradients.primary}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={styles.gradient}
        >
          {shimmer && <Shimmer />}
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </PressableScale>
  );
}

/** Brillo que recorre el botón principal, como en la web. */
function Shimmer() {
  const x = useSharedValue(-1);
  useEffect(() => {
    x.value = withRepeat(withDelay(1400, withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.cubic) })), -1, false);
  }, [x]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 260 }, { skewX: '-20deg' }] }));
  return (
    <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.shimmerWrap, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.shimmer}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: { overflow: 'visible' },
  gradient: { borderRadius: radius.pill, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 24 },
  label: { fontFamily: fonts.bold, letterSpacing: -0.2 },
  outline: { borderWidth: 1, borderColor: colors.borderStrong, backgroundColor: 'rgba(255,255,255,0.02)' },
  dark: { backgroundColor: '#03050A', borderWidth: 1, borderColor: colors.border },
  soft: { backgroundColor: 'rgba(46,230,197,0.08)', borderWidth: 1, borderColor: 'rgba(46,230,197,0.45)' },
  glow: {
    shadowColor: colors.teal,
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  shimmerWrap: { alignItems: 'flex-start', justifyContent: 'center' },
  shimmer: { width: 70, height: '100%' },
});
