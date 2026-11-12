import { StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { Icon } from './Icon';
import { PressableScale } from './Pressable';
import { useToast } from './Toast';

/** Corazón para guardar vehículos o estaciones, con rebote al marcarlo. */
export function FavoriteButton({ kind, id, size = 40, label }: { kind: 'vehicle' | 'station'; id: string; size?: number; label: string }) {
  const { isFavorite, toggleFavorite } = useStore();
  const toast = useToast();
  const fav = isFavorite(kind, id);
  const s = useSharedValue(1);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  return (
    <PressableScale
      haptics={false}
      accessibilityLabel={fav ? `Quitar ${label} de favoritos` : `Guardar ${label} en favoritos`}
      onPress={() => {
        const added = toggleFavorite(kind, id);
        s.value = withSequence(withSpring(1.35, { damping: 6, stiffness: 400 }), withSpring(1));
        if (added) {
          haptic.success();
          toast({ title: 'Guardado en favoritos', body: label, icon: 'heart', color: colors.pink });
        } else haptic.light();
      }}
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }, fav && styles.active]}
    >
      <Animated.View style={style}>
        <Icon name={fav ? 'mci:heart' : 'mci:heart-outline'} size={size * 0.5} color={fav ? colors.pink : colors.textSoft} />
      </Animated.View>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  btn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5,7,13,0.65)',
    borderWidth: 1,
    borderColor: colors.border,
  },
  active: { borderColor: 'rgba(236,72,153,0.5)', backgroundColor: 'rgba(236,72,153,0.12)' },
});
