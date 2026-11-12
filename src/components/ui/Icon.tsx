import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type FeatherName = ComponentProps<typeof Feather>['name'];
export type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];
export type IconName = FeatherName | `mci:${MciName}`;

/** Un solo componente de íconos: Feather por defecto y "mci:<nombre>" para MaterialCommunityIcons. */
export function Icon({ name, size = 20, color }: { name: IconName; size?: number; color: string }) {
  if (name.startsWith('mci:')) {
    return <MaterialCommunityIcons name={name.slice(4) as MciName} size={size} color={color} />;
  }
  return <Feather name={name as FeatherName} size={size} color={color} />;
}
