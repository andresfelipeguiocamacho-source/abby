import type { Accent } from '@/lib/theme';

export type ProductCategory = 'cargador' | 'servicio' | 'accesorio' | 'membresia' | 'recarga';

export type Product = {
  id: string;
  category: ProductCategory;
  name: string;
  subtitle: string;
  price: number; // COP
  priceSuffix?: string;
  badge?: string;
  chips: string[];
  features: string[];
  accent: Accent;
  icon: 'plug' | 'zap' | 'home' | 'building' | 'shield' | 'cable' | 'battery' | 'card' | 'gift' | 'tool';
  /** saldo que se abona a la billetera (recargas) */
  walletCredit?: number;
};

export const products: Product[] = [
  {
    id: 'wallbox-7',
    category: 'cargador',
    name: 'Wallbox Casa 7 kW',
    subtitle: 'Casa o apartamento con parqueadero propio',
    price: 4_290_000,
    chips: ['7 kW · monofásico', 'Type 2 · 32 A', 'Carga completa en 6–8 h'],
    features: ['Programable por horario', 'Protección contra sobretensión', 'Cable de 5 m incluido'],
    accent: 'teal',
    icon: 'home',
  },
  {
    id: 'wallbox-11',
    category: 'cargador',
    name: 'Wallbox Pro 11 kW',
    subtitle: 'Casas y conjuntos con red trifásica',
    price: 5_690_000,
    badge: 'El más pedido',
    chips: ['11 kW · trifásico', 'Type 2 · 16 A', 'Carga completa en 4–5 h'],
    features: ['App con consumo en tiempo real', 'Control de acceso RFID', 'Balanceo de carga dinámico'],
    accent: 'blue',
    icon: 'zap',
  },
  {
    id: 'estacion-22',
    category: 'cargador',
    name: 'Estación comercial 22 kW',
    subtitle: 'Empresas, conjuntos y parqueaderos',
    price: 12_900_000,
    chips: ['22 kW · doble toma', 'OCPP 1.6', 'Cobro por usuario'],
    features: ['Dos vehículos a la vez', 'Plataforma de facturación', 'Pedestal o pared'],
    accent: 'violet',
    icon: 'building',
  },
  {
    id: 'instalacion-retie',
    category: 'servicio',
    name: 'Instalación certificada RETIE',
    subtitle: 'Incluye visita técnica, materiales hasta 15 m y certificado',
    price: 1_350_000,
    priceSuffix: 'desde',
    chips: ['Certificado RETIE', 'Visita en 48 h', 'Garantía 1 año'],
    features: ['Medimos tu acometida antes de instalar', 'Tablero y protecciones', 'Puesta en marcha'],
    accent: 'amber',
    icon: 'shield',
  },
  {
    id: 'estudio-carga',
    category: 'servicio',
    name: 'Estudio de carga',
    subtitle: 'Sabemos si tu instalación aguanta el cargador',
    price: 250_000,
    chips: ['Visita técnica', 'Informe en 24 h'],
    features: ['Se descuenta si instalas con nosotros', 'Alternativas más baratas si no aplica'],
    accent: 'pink',
    icon: 'tool',
  },
  {
    id: 'cable-type2',
    category: 'accesorio',
    name: 'Cable Type 2 de 7 m',
    subtitle: 'Para estaciones públicas sin cable',
    price: 890_000,
    chips: ['32 A · trifásico', 'Bolso incluido'],
    features: ['IP54', 'Compatible con todos los Type 2'],
    accent: 'teal',
    icon: 'cable',
  },
  {
    id: 'cargador-portatil',
    category: 'accesorio',
    name: 'Cargador portátil 3,5 kW',
    subtitle: 'Carga de emergencia en cualquier toma',
    price: 1_590_000,
    chips: ['Toma 110/220 V', 'Pantalla LCD'],
    features: ['Corriente ajustable', 'Ideal para viajes y fincas'],
    accent: 'blue',
    icon: 'plug',
  },
  {
    id: 'socio-fundador',
    category: 'membresia',
    name: 'Tarjeta de socio · Fundador',
    subtitle: 'Precio preferencial para los primeros socios',
    price: 39_900,
    priceSuffix: '/ mes',
    badge: 'Próximamente',
    chips: ['Descuento en cada recarga', 'Asesoría permanente'],
    features: [
      '15 % menos en estaciones AMPERIA',
      'Carga gratis en estaciones solares',
      'Refacciones con prioridad',
      'Cobro desde el lanzamiento',
    ],
    accent: 'pink',
    icon: 'card',
  },
  {
    id: 'recarga-50',
    category: 'recarga',
    name: 'Saldo $50.000',
    subtitle: 'Para cargar en la red AMPERIA',
    price: 50_000,
    chips: ['Sin vencimiento'],
    features: [],
    accent: 'teal',
    icon: 'battery',
    walletCredit: 50_000,
  },
  {
    id: 'recarga-100',
    category: 'recarga',
    name: 'Saldo $100.000',
    subtitle: 'Recibes $105.000',
    price: 100_000,
    badge: '+5 %',
    chips: ['Bono 5 %'],
    features: [],
    accent: 'blue',
    icon: 'battery',
    walletCredit: 105_000,
  },
  {
    id: 'recarga-200',
    category: 'recarga',
    name: 'Saldo $200.000',
    subtitle: 'Recibes $220.000',
    price: 200_000,
    badge: '+10 %',
    chips: ['Bono 10 %'],
    features: [],
    accent: 'violet',
    icon: 'gift',
    walletCredit: 220_000,
  },
];

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}
