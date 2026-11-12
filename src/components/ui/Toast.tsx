import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radius } from '@/lib/theme';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './Pressable';
import { AppText } from './Text';

type ToastData = {
  id: number;
  title: string;
  body?: string;
  icon?: IconName;
  color?: string;
  action?: { label: string; onPress: () => void };
};

const ToastContext = createContext<(t: Omit<ToastData, 'id'>) => void>(() => undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const next = useRef(1);
  const insets = useSafeAreaInsets();

  const show = useCallback((t: Omit<ToastData, 'id'>) => {
    const id = next.current++;
    setToasts((list) => [...list.slice(-1), { ...t, id }]);
    setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <View pointerEvents="box-none" style={[styles.host, { top: insets.top + 8 }]}>
        {toasts.map((t) => (
          <Animated.View
            key={t.id}
            entering={FadeInUp.springify().damping(16)}
            exiting={FadeOutUp.duration(220)}
            layout={LinearTransition}
            style={styles.toast}
          >
            <View style={[styles.dot, { backgroundColor: t.color ?? colors.teal }]}>
              <Icon name={t.icon ?? 'check'} size={16} color={colors.onAccent} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="title" style={{ fontSize: 15 }}>
                {t.title}
              </AppText>
              {t.body ? <AppText variant="small">{t.body}</AppText> : null}
            </View>
            {t.action ? (
              <PressableScale
                onPress={() => {
                  t.action?.onPress();
                  setToasts((list) => list.filter((x) => x.id !== t.id));
                }}
                style={styles.action}
              >
                <AppText style={{ fontFamily: fonts.bold, color: colors.teal, fontSize: 14 }}>{t.action.label}</AppText>
              </PressableScale>
            ) : null}
          </Animated.View>
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

const styles = StyleSheet.create({
  host: { position: 'absolute', left: 16, right: 16, gap: 8, zIndex: 1000 },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(17,23,34,0.97)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
  },
  dot: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  action: { paddingHorizontal: 10, paddingVertical: 6 },
});
