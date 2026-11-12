/**
 * Sistema visual de AMPERIA.
 * Paleta tomada de la página web (fondo casi negro, acentos verde-agua → azul → violeta → rosa → ámbar).
 * El logo violeta/magenta se usa sólo en la pantalla de bienvenida, el ícono y el splash.
 */
export const colors = {
  bg: '#05070D',
  bgElevated: '#080B13',
  surface: '#0C1018',
  surface2: '#111722',
  surface3: '#171E2B',
  border: 'rgba(255,255,255,0.08)',
  borderStrong: 'rgba(255,255,255,0.16)',
  text: '#F5F7FA',
  textSoft: '#C9D1DE',
  muted: '#8A94A6',
  faint: '#5A6478',

  teal: '#2EE6C5',
  tealDeep: '#14B8A6',
  blue: '#3B82F6',
  violet: '#8B5CF6',
  pink: '#EC4899',
  amber: '#F5A623',
  red: '#F43F5E',
  green: '#22C55E',

  onAccent: '#04110F',

  // Marca (logo)
  brandViolet: '#5B3FD6',
  brandMagenta: '#E83E9C',
  brandPink: '#FF8AC4',
  brandNavy: '#161B45',
  brandCream: '#F7F2EA',
} as const;

export const gradients = {
  primary: ['#2EE6C5', '#3B82F6'] as const,
  spectrum: ['#2EE6C5', '#3B82F6', '#8B5CF6', '#EC4899'] as const,
  cool: ['#3B82F6', '#8B5CF6'] as const,
  violet: ['#8B5CF6', '#EC4899'] as const,
  warm: ['#EC4899', '#F5A623'] as const,
  sunrise: ['#F5A623', '#2EE6C5'] as const,
  brand: ['#5B3FD6', '#E83E9C', '#FF8AC4'] as const,
};

export type Accent = 'teal' | 'blue' | 'violet' | 'pink' | 'amber';

export const accentGradient: Record<Accent, readonly [string, string]> = {
  teal: gradients.primary,
  blue: gradients.cool,
  violet: gradients.violet,
  pink: gradients.warm,
  amber: gradients.sunrise,
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
  mono: 'JetBrainsMono_500Medium',
  monoBold: 'JetBrainsMono_700Bold',
} as const;

export const radius = { sm: 12, md: 18, lg: 24, xl: 30, pill: 999 } as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28, gutter: 20 } as const;

export function alpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const n = parseInt(
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h,
    16,
  );
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${a})`;
}
