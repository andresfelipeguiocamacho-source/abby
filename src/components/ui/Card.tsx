import { LinearGradient } from 'expo-linear-gradient';
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { accentGradient, alpha, colors, radius, type Accent } from '@/lib/theme';
import { Icon, type IconName } from './Icon';

/** Tarjeta oscura con un brillo de color en la esquina superior derecha (estilo de la web). */
export function Card({
  children,
  accent,
  style,
  padded = true,
  intensity = 0.16,
}: {
  children: ReactNode;
  accent?: Accent;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  intensity?: number;
}) {
  return (
    <View style={[styles.card, padded && styles.padded, style]}>
      {accent && (
        <LinearGradient
          pointerEvents="none"
          colors={[alpha(accentGradient[accent][0], intensity), 'rgba(0,0,0,0)']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.9 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children}
    </View>
  );
}

/** Cuadro con degradado e ícono (los cuadritos de colores de la web). */
export function IconBox({
  icon,
  accent = 'teal',
  size = 56,
  iconSize,
  variant = 'filled',
}: {
  icon: IconName;
  accent?: Accent;
  size?: number;
  iconSize?: number;
  variant?: 'filled' | 'tinted';
}) {
  const [a, b] = accentGradient[accent];
  if (variant === 'tinted') {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.3,
            backgroundColor: alpha(a, 0.1),
            borderColor: alpha(a, 0.4),
            borderWidth: 1,
          },
        ]}
      >
        <Icon name={icon} size={iconSize ?? size * 0.42} color={a} />
      </View>
    );
  }
  return (
    <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.3 }]}>
      <LinearGradient
        colors={[a, b]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size * 0.3 }]}
      />
      <Icon name={icon} size={iconSize ?? size * 0.42} color={colors.onAccent} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  padded: { padding: 22 },
  box: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});
