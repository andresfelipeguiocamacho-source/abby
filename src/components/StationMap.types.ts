import type { Station } from '@/data/stations';

export type LatLng = { latitude: number; longitude: number };

export type StationMapProps = {
  stations: Station[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  userLocation: LatLng | null;
  favorites: string[];
  height: number;
};

export type StationMapHandle = {
  focus: (point: LatLng, zoom?: 'near' | 'city') => void;
};
