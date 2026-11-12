import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { colors, gradients } from '@/lib/theme';

/** Insignia del rayo (verde-agua → azul) usada dentro de la app, como en la web. */
export function BoltBadge({ size = 40 }: { size?: number }) {
  return (
    <View style={[styles.glow, { width: size, height: size, borderRadius: size * 0.32 }]}>
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: size * 0.32 }]}
      />
      <View style={styles.icon}>
        <Svg width={size * 0.5} height={size * 0.5} viewBox="0 0 24 24">
          <Path
            d="M13 2 L4 14 H11 L10 22 L20 9 H13 L13 2 Z"
            fill="none"
            stroke={colors.onAccent}
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  icon: { position: 'relative', zIndex: 1 },
  glow: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.teal,
    shadowOpacity: 0.45,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
});
