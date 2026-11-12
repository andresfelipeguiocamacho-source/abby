import Svg, { ClipPath, Defs, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors } from '@/lib/theme';

/**
 * Logo oficial de AMPERIA (la "A" de montaña partida por un rayo), dibujado en vectores
 * para que se vea nítido a cualquier resolución.
 */
export function AmperiaMark({ size = 120, id = 'amp' }: { size?: number; id?: string }) {
  const gid = `${id}-grad`;
  const cid = `${id}-clip`;
  return (
    <Svg width={size} height={size * 0.85} viewBox="0 0 200 170">
      <Defs>
        <LinearGradient id={gid} gradientUnits="userSpaceOnUse" x1="10" y1="166" x2="190" y2="10">
          <Stop offset="0" stopColor={colors.brandViolet} />
          <Stop offset="0.55" stopColor={colors.brandMagenta} />
          <Stop offset="1" stopColor={colors.brandPink} />
        </LinearGradient>
        <ClipPath id={cid}>
          <Rect x="0" y="0" width="200" height="164" />
        </ClipPath>
      </Defs>
      <G fill="none" stroke={`url(#${gid})`} strokeLinejoin="bevel" clipPath={`url(#${cid})`}>
        {/* Pierna izquierda + ápice + tramo superior derecho */}
        <Path d="M8 184 L100 14 L138 84" strokeWidth={30} />
        {/* Pierna derecha inferior: el rayo la separa del ápice */}
        <Path d="M147 101 L192 184" strokeWidth={30} />
        {/* Rayo que cruza la A como una cordillera */}
        <Path d="M56 130 L99 104 L93 128 L156 92" strokeWidth={15} strokeLinejoin="miter" strokeMiterlimit={8} />
      </G>
    </Svg>
  );
}

/** Palabra "AMPERIA" con las A abiertas (Λ), como en el logo. */
export function AmperiaWordmark({ width = 220, color = colors.text }: { width?: number; color?: string }) {
  return (
    <Svg width={width} height={(width * 52) / 290} viewBox="-4 -2 290 52">
      <G stroke={color} strokeWidth={5.5} fill="none" strokeLinejoin="miter" strokeLinecap="butt">
        <Path d="M0 46 L18 4 L36 46" />
        <Path d="M50 46 L50 4 L68 30 L86 4 L86 46" />
        <Path d="M101 46 L101 4 L118 4 Q132 4 132 17 Q132 30 118 30 L101 30" />
        <Path d="M172 4 L147 4 L147 46 L172 46 M147 25 L168 25" />
        <Path d="M186 46 L186 4 L203 4 Q217 4 217 17 Q217 30 203 30 L186 30 M202 30 L218 46" />
        <Path d="M234 4 L234 46" />
        <Path d="M246 46 L264 4 L282 46" />
      </G>
    </Svg>
  );
}
