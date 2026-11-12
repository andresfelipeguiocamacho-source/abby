import { router, type Href } from 'expo-router';
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

export function goNext(next?: string) {
  if (next) router.replace(next as Href);
  else if (router.canGoBack()) router.back();
  else router.replace('/cuenta');
}

/** Sacudida horizontal para errores de formulario. */
export function useShake() {
  const x = useSharedValue(0);
  const style = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  const shake = () => {
    x.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-6, { duration: 50 }),
      withTiming(0, { duration: 50 }),
    );
  };
  return { style, shake };
}
