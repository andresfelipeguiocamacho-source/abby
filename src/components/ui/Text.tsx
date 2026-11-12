import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentType, ReactElement, ReactNode } from 'react';
import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, fonts, gradients } from '@/lib/theme';

export type TextVariant = 'display' | 'h1' | 'h2' | 'h3' | 'title' | 'body' | 'bodyStrong' | 'small' | 'label' | 'mono' | 'price';

const variants: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.extrabold, fontSize: 44, lineHeight: 46, letterSpacing: -1.8, color: colors.text },
  h1: { fontFamily: fonts.extrabold, fontSize: 34, lineHeight: 38, letterSpacing: -1.2, color: colors.text },
  h2: { fontFamily: fonts.extrabold, fontSize: 26, lineHeight: 30, letterSpacing: -0.8, color: colors.text },
  h3: { fontFamily: fonts.bold, fontSize: 20, lineHeight: 25, letterSpacing: -0.4, color: colors.text },
  title: { fontFamily: fonts.bold, fontSize: 16, lineHeight: 21, letterSpacing: -0.2, color: colors.text },
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 23, color: colors.muted },
  bodyStrong: { fontFamily: fonts.semibold, fontSize: 15, lineHeight: 22, color: colors.textSoft },
  small: { fontFamily: fonts.medium, fontSize: 13, lineHeight: 18, color: colors.muted },
  label: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 2.4, textTransform: 'uppercase', color: colors.teal },
  mono: { fontFamily: fonts.mono, fontSize: 12, lineHeight: 16, letterSpacing: 1.2, color: colors.muted },
  price: { fontFamily: fonts.extrabold, fontSize: 30, lineHeight: 34, letterSpacing: -1, color: colors.text },
};

export type AppTextProps = TextProps & { variant?: TextVariant; color?: string; center?: boolean };

export function AppText({ variant = 'body', color, center, style, ...rest }: AppTextProps) {
  return <Text {...rest} style={[variants[variant], color ? { color } : null, center && { textAlign: 'center' }, style]} />;
}

/** Texto con degradado (como "resuelto." en la web). */
export function GradientText({
  children,
  variant = 'h1',
  colors: grad = gradients.spectrum,
  style,
}: {
  children: string;
  variant?: TextVariant;
  colors?: readonly [string, string, ...string[]];
  style?: TextStyle;
}) {
  if (Platform.OS === 'web') {
    // En web usamos CSS nativo (background-clip) para el mismo efecto.
    return (
      <Text
        style={[
          variants[variant],
          style,
          {
            backgroundImage: `linear-gradient(90deg, ${grad.join(',')})`,
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            color: 'transparent',
          } as unknown as TextStyle,
        ]}
      >
        {children}
      </Text>
    );
  }
  return (
    <Masked maskElement={<Text style={[variants[variant], style]}>{children}</Text>}>
      <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
        <Text style={[variants[variant], style, styles.hidden]}>{children}</Text>
      </LinearGradient>
    </Masked>
  );
}

const styles = StyleSheet.create({ hidden: { opacity: 0 } });

// Los tipos de masked-view aún declaran un componente de clase incompatible con React 19.
const Masked = MaskedView as unknown as ComponentType<{ maskElement: ReactElement; children: ReactNode }>;
