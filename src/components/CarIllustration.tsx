import { memo } from 'react';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import type { BodyType, Paint } from '@/data/vehicles';

/**
 * Ilustración vectorial del vehículo (vista lateral 3/4 estilizada).
 * Al ser SVG se renderiza nítida en cualquier pantalla (incluido 4K) y cambia de color en vivo.
 */
type Shape = {
  body: string;
  rearWindow: string;
  frontWindow: string;
  wheels: [number, number];
  doorX: number;
  head: string;
  tail: string;
  beltY: number;
};

const SHAPES: Record<BodyType, Shape> = {
  suv: {
    body: 'M20 118 L20 96 Q20 76 36 72 L70 66 Q84 44 100 38 L250 36 Q262 36 272 44 L304 68 L352 76 Q372 80 378 94 L380 112 Q380 120 372 122 L337 122 A32 32 0 0 0 273 122 L127 122 A32 32 0 0 0 63 122 L28 122 Q20 122 20 118 Z',
    rearWindow: 'M84 67 Q96 50 110 46 L180 45 L180 67 Z',
    frontWindow: 'M188 45 L246 44 Q256 44 263 50 L290 68 L188 68 Z',
    wheels: [95, 305],
    doorX: 184,
    head: 'M356 82 L376 88 L377 94 L360 92 Z',
    tail: 'M21 80 L32 77 L32 90 L21 91 Z',
    beltY: 86,
  },
  sedan: {
    body: 'M18 112 L20 98 Q22 86 40 84 L92 80 Q120 52 150 46 L236 44 Q252 44 266 54 L300 76 L350 82 Q374 86 380 100 L381 112 Q381 120 372 122 L337 122 A32 32 0 0 0 273 122 L127 122 A32 32 0 0 0 63 122 L26 122 Q18 120 18 112 Z',
    rearWindow: 'M112 79 Q130 59 152 53 L194 51 L194 79 Z',
    frontWindow: 'M202 51 L236 51 Q250 51 262 59 L290 78 L202 79 Z',
    wheels: [95, 305],
    doorX: 198,
    head: 'M354 88 L378 96 L379 102 L358 99 Z',
    tail: 'M19 92 L34 90 L33 100 L19 102 Z',
    beltY: 94,
  },
  hatch: {
    body: 'M40 116 L40 90 Q40 70 52 62 L74 44 Q82 38 96 38 L220 38 Q234 38 246 48 L276 70 L330 78 Q352 82 358 96 L360 112 Q360 120 352 122 L322 122 A32 32 0 0 0 258 122 L132 122 A32 32 0 0 0 68 122 L46 122 Q40 122 40 116 Z',
    rearWindow: 'M62 68 L80 48 Q86 44 96 44 L158 44 L158 68 Z',
    frontWindow: 'M166 44 L218 44 Q230 44 240 52 L264 70 L166 70 Z',
    wheels: [100, 290],
    doorX: 162,
    head: 'M336 84 L356 91 L357 97 L340 95 Z',
    tail: 'M41 74 L50 72 L50 86 L41 87 Z',
    beltY: 88,
  },
};

function Wheel({ cx, id, accent }: { cx: number; id: string; accent: string }) {
  const cy = 124;
  const spokes = [0, 72, 144, 216, 288];
  return (
    <G>
      <Circle cx={cx} cy={cy} r={27} fill="#07090D" />
      <Circle cx={cx} cy={cy} r={25} fill="none" stroke="#1C212B" strokeWidth={2} />
      <Circle cx={cx} cy={cy} r={18} fill={`url(#${id}-rim)`} />
      {spokes.map((a) => {
        const r = (a * Math.PI) / 180;
        return (
          <Path
            key={a}
            d={`M${cx} ${cy} L${cx + Math.cos(r) * 16} ${cy + Math.sin(r) * 16}`}
            stroke="#2A303C"
            strokeWidth={4.5}
            strokeLinecap="round"
          />
        );
      })}
      <Circle cx={cx} cy={cy} r={18} fill="none" stroke={accent} strokeOpacity={0.55} strokeWidth={1.2} />
      <Circle cx={cx} cy={cy} r={4.5} fill="#AEB6C4" />
    </G>
  );
}

function CarIllustrationBase({
  body,
  paint,
  width = 320,
  accent = '#2EE6C5',
  id = 'car',
  glow = true,
}: {
  body: BodyType;
  paint: Paint;
  width?: number;
  accent?: string;
  id?: string;
  glow?: boolean;
}) {
  const s = SHAPES[body];
  return (
    <Svg width={width} height={(width * 165) / 400} viewBox="0 0 400 165">
      <Defs>
        <LinearGradient id={`${id}-paint`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={paint.base} stopOpacity={1} />
          <Stop offset="0.55" stopColor={paint.base} stopOpacity={0.92} />
          <Stop offset="1" stopColor={paint.shade} stopOpacity={1} />
        </LinearGradient>
        <LinearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="0.45" stopColor="#FFFFFF" stopOpacity={0.35} />
          <Stop offset="0.6" stopColor="#FFFFFF" stopOpacity={0} />
        </LinearGradient>
        <LinearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#3A4A66" />
          <Stop offset="0.5" stopColor="#141B29" />
          <Stop offset="1" stopColor="#0B0F18" />
        </LinearGradient>
        <LinearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#E4E8EF" />
          <Stop offset="1" stopColor="#5D6573" />
        </LinearGradient>
        <RadialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor="#000000" stopOpacity={0.75} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0} />
        </RadialGradient>
        <RadialGradient id={`${id}-glow`} cx="0.5" cy="0.5" r="0.5">
          <Stop offset="0" stopColor={accent} stopOpacity={0.35} />
          <Stop offset="1" stopColor={accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {glow && <Ellipse cx={200} cy={110} rx={190} ry={60} fill={`url(#${id}-glow)`} />}
      <Ellipse cx={200} cy={152} rx={178} ry={10} fill={`url(#${id}-shadow)`} />

      {/* Carrocería */}
      <Path d={s.body} fill={`url(#${id}-paint)`} />
      <Path d={s.body} fill={`url(#${id}-sheen)`} />
      <Path d={s.body} fill="none" stroke="#FFFFFF" strokeOpacity={0.18} strokeWidth={1} />

      {/* Ventanas */}
      <Path d={s.rearWindow} fill={`url(#${id}-glass)`} />
      <Path d={s.frontWindow} fill={`url(#${id}-glass)`} />
      <Path d={s.frontWindow} fill="none" stroke="#FFFFFF" strokeOpacity={0.12} strokeWidth={1} />

      {/* Línea de carácter, puertas y manijas */}
      <Path d={`M40 ${s.beltY} L360 ${s.beltY + 4}`} stroke="#FFFFFF" strokeOpacity={0.25} strokeWidth={1.2} />
      <Path d={`M${s.doorX} 70 L${s.doorX + 2} 120`} stroke="#000000" strokeOpacity={0.3} strokeWidth={1.2} />
      <Rect x={s.doorX - 30} y={s.beltY + 6} width={16} height={3.5} rx={1.75} fill="#000000" fillOpacity={0.35} />
      <Rect x={s.doorX + 40} y={s.beltY + 7} width={16} height={3.5} rx={1.75} fill="#000000" fillOpacity={0.35} />

      {/* Molduras inferiores */}
      <Path d={`M${s.wheels[0] - 36} 122 A36 36 0 0 1 ${s.wheels[0] + 36} 122`} stroke="#0A0C11" strokeWidth={5} fill="none" />
      <Path d={`M${s.wheels[1] - 36} 122 A36 36 0 0 1 ${s.wheels[1] + 36} 122`} stroke="#0A0C11" strokeWidth={5} fill="none" />
      <Path d={`M${s.wheels[0] + 38} 120 L${s.wheels[1] - 38} 120`} stroke="#0A0C11" strokeOpacity={0.55} strokeWidth={4} />

      {/* Luces */}
      <Path d={s.head} fill={accent} />
      <Path d={s.head} fill="#FFFFFF" fillOpacity={0.5} />
      <Path d={s.tail} fill="#F43F5E" />

      <Wheel cx={s.wheels[0]} id={id} accent={accent} />
      <Wheel cx={s.wheels[1]} id={id} accent={accent} />
    </Svg>
  );
}

export const CarIllustration = memo(CarIllustrationBase);
