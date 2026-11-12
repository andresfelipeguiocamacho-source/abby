import { useEffect, useRef, useState } from 'react';
import type { TextStyle } from 'react-native';

import { formatNumber } from '@/lib/format';
import { AppText, type TextVariant } from './Text';

/** Número que cuenta hasta su valor con easing (ahorros, estadísticas). */
export function AnimatedNumber({
  value,
  prefix = '',
  suffix = '',
  duration = 900,
  decimals = 0,
  variant = 'price',
  color,
  style,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  decimals?: number;
  variant?: TextVariant;
  color?: string;
  style?: TextStyle;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const first = useRef(true);

  useEffect(() => {
    const start = first.current ? 0 : from.current;
    first.current = false;
    const t0 = Date.now();
    let raf = 0;
    const tick = () => {
      const p = Math.min(1, (Date.now() - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (value - start) * eased;
      setDisplay(v);
      from.current = v;
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <AppText variant={variant} color={color} style={style}>
      {prefix}
      {formatNumber(display, decimals)}
      {suffix}
    </AppText>
  );
}
