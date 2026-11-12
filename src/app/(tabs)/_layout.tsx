import { LinearGradient } from 'expo-linear-gradient';
import { Tabs } from 'expo-router/js-tabs';
import { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { colors, fonts, gradients } from '@/lib/theme';

function TabIcon({ name, focused }: { name: IconName; focused: boolean }) {
  const s = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    s.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 220 });
  }, [focused, s]);
  const pill = useAnimatedStyle(() => ({ opacity: s.value, transform: [{ scaleX: 0.6 + s.value * 0.4 }] }));
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: -s.value * 2 }, { scale: 1 + s.value * 0.08 }] }));
  return (
    <View style={styles.iconWrap}>
      <Animated.View style={[styles.pill, pill]}>
        <LinearGradient colors={gradients.primary} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />
      </Animated.View>
      <Animated.View style={icon}>
        <Icon name={name} size={22} color={focused ? colors.onAccent : colors.muted} />
      </Animated.View>
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabs: { name: string; title: string; icon: IconName }[] = [
    { name: 'inicio', title: 'Inicio', icon: 'home' },
    { name: 'catalogo', title: 'Catálogo', icon: 'mci:car-electric-outline' },
    { name: 'mapa', title: 'Estaciones', icon: 'mci:ev-station' },
    { name: 'tienda', title: 'Tienda', icon: 'shopping-bag' },
    { name: 'cuenta', title: 'Cuenta', icon: 'user' },
  ];
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        headerShown: false,
        animation: 'shift',
        sceneStyle: { backgroundColor: colors.bg },
        tabBarActiveTintColor: colors.teal,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11, lineHeight: 14, marginTop: 4 },
        tabBarStyle: {
          backgroundColor: Platform.OS === 'web' ? 'rgba(8,11,19,0.98)' : 'rgba(8,11,19,0.97)',
          borderTopColor: colors.border,
          height: 82 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 14),
        },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{ title: t.title, tabBarIcon: ({ focused }) => <TabIcon name={t.icon} focused={focused} /> }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 54, height: 32, alignItems: 'center', justifyContent: 'center' },
  pill: { ...StyleSheet.absoluteFill, borderRadius: 16, overflow: 'hidden' },
});
