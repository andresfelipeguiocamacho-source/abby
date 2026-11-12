export type StationKind = 'rapida' | 'lenta' | 'solar';

export type Station = {
  id: string;
  name: string;
  zone: string;
  address: string;
  kind: StationKind;
  free?: boolean; // anillo rosa: gratis o para socios
  powerKW: number;
  connectors: string[];
  pricePerKWh: number | null; // null = gratis
  priceNote?: string;
  hours: string;
  amenities: string[];
  latitude: number;
  longitude: number;
  ports: number;
  available: number;
};

/** Red de estaciones AMPERIA en Bogotá (coordenadas aproximadas). */
export const stations: Station[] = [
  {
    id: 'norte-usaquen',
    name: 'Amp Norte · Usaquén',
    zone: 'Norte',
    address: 'Cra. 15 con Calle 116',
    kind: 'rapida',
    powerKW: 120,
    connectors: ['CCS2', 'Type 2'],
    pricePerKWh: 1290,
    hours: 'Abierta 24 horas',
    amenities: ['Café', 'Baños', 'Vigilancia 24 h', 'Parqueadero cubierto'],
    latitude: 4.6976,
    longitude: -74.0446,
    ports: 6,
    available: 4,
  },
  {
    id: 'chapinero',
    name: 'Amp Chapinero',
    zone: 'Chapinero',
    address: 'Calle 63 con Cra. 7',
    kind: 'rapida',
    powerKW: 60,
    connectors: ['CCS2', 'CHAdeMO', 'Type 2'],
    pricePerKWh: 1190,
    hours: '6:00 a. m. – 11:00 p. m.',
    amenities: ['Café', 'Wi-Fi', 'Baños'],
    latitude: 4.6486,
    longitude: -74.0628,
    ports: 4,
    available: 1,
  },
  {
    id: 'centro-candelaria',
    name: 'Amp Centro · La Candelaria',
    zone: 'Centro',
    address: 'Calle 11 con Cra. 4',
    kind: 'lenta',
    free: true,
    powerKW: 7,
    connectors: ['Type 2'],
    pricePerKWh: null,
    priceNote: 'Gratis la primera hora',
    hours: '7:00 a. m. – 9:00 p. m.',
    amenities: ['Zona cultural', 'Vigilancia'],
    latitude: 4.5981,
    longitude: -74.0742,
    ports: 8,
    available: 5,
  },
  {
    id: 'salitre-dorado',
    name: 'Amp Salitre · El Dorado',
    zone: 'Occidente',
    address: 'Av. El Dorado con Cra. 68',
    kind: 'rapida',
    powerKW: 150,
    connectors: ['CCS2', 'Type 2'],
    pricePerKWh: 1390,
    hours: 'Abierta 24 horas',
    amenities: ['Restaurante', 'Baños', 'Vigilancia 24 h'],
    latitude: 4.6557,
    longitude: -74.1048,
    ports: 8,
    available: 6,
  },
  {
    id: 'suba-solar',
    name: 'Amp Suba Solar',
    zone: 'Suba',
    address: 'Av. Suba con Calle 145',
    kind: 'solar',
    free: true,
    powerKW: 22,
    connectors: ['Type 2'],
    pricePerKWh: 790,
    priceNote: 'Gratis para socios',
    hours: '6:00 a. m. – 10:00 p. m.',
    amenities: ['Paneles solares', 'Parque', 'Bicicletero'],
    latitude: 4.7423,
    longitude: -74.0838,
    ports: 6,
    available: 3,
  },
  {
    id: 'sur-solar',
    name: 'Amp Sur Solar · Restrepo',
    zone: 'Sur',
    address: 'Av. Primero de Mayo con Cra. 24',
    kind: 'solar',
    free: true,
    powerKW: 22,
    connectors: ['Type 2'],
    pricePerKWh: 790,
    priceNote: 'Gratis para socios',
    hours: '6:00 a. m. – 10:00 p. m.',
    amenities: ['Paneles solares', 'Baños'],
    latitude: 4.5856,
    longitude: -74.1036,
    ports: 4,
    available: 2,
  },
  {
    id: 'fontibon',
    name: 'Amp Fontibón',
    zone: 'Fontibón',
    address: 'Calle 17 con Cra. 100',
    kind: 'rapida',
    powerKW: 90,
    connectors: ['CCS2', 'Type 2'],
    pricePerKWh: 1250,
    hours: 'Abierta 24 horas',
    amenities: ['Tienda', 'Baños', 'Vigilancia 24 h'],
    latitude: 4.6718,
    longitude: -74.1446,
    ports: 4,
    available: 2,
  },
  {
    id: 'kennedy',
    name: 'Amp Kennedy · Américas',
    zone: 'Kennedy',
    address: 'Av. Américas con Av. Boyacá',
    kind: 'lenta',
    powerKW: 11,
    connectors: ['Type 2'],
    pricePerKWh: 990,
    hours: '6:00 a. m. – 10:00 p. m.',
    amenities: ['Centro comercial', 'Baños'],
    latitude: 4.6301,
    longitude: -74.1381,
    ports: 10,
    available: 7,
  },
  {
    id: 'la-calera',
    name: 'Amp La Calera · Vía Patios',
    zone: 'La Calera',
    address: 'Km 5 vía La Calera',
    kind: 'rapida',
    powerKW: 120,
    connectors: ['CCS2', 'Type 2'],
    pricePerKWh: 1290,
    hours: 'Abierta 24 horas',
    amenities: ['Mirador', 'Café', 'Baños'],
    latitude: 4.6746,
    longitude: -74.0205,
    ports: 4,
    available: 4,
  },
];

export const stationKindLabel: Record<StationKind, string> = {
  rapida: 'Carga rápida',
  lenta: 'Carga lenta',
  solar: 'Solar',
};

export const stationKindColor: Record<StationKind, string> = {
  rapida: '#2EE6C5',
  lenta: '#3B82F6',
  solar: '#F5A623',
};

export const BOGOTA_REGION = {
  latitude: 4.6551,
  longitude: -74.0836,
  latitudeDelta: 0.24,
  longitudeDelta: 0.2,
};

export function getStation(id: string) {
  return stations.find((s) => s.id === id);
}

/** Distancia en km (Haversine). */
export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const la1 = (a.latitude * Math.PI) / 180;
  const la2 = (b.latitude * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
