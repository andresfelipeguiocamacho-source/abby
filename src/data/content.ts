/** Textos de la web AMPERIA reutilizados en la app. */
export const faqs = [
  {
    q: '¿Ustedes venden los carros o solo me conectan con alguien?',
    a: 'Los carros los vende el concesionario o el dueño (si es usado): nosotros te conectamos con el vendedor correcto, te decimos qué preguntar y puedes separar el carro desde la app. Los cargadores, la instalación, los accesorios y la red de estaciones sí son nuestros.',
  },
  {
    q: '¿Qué incluye el cargador que venden?',
    a: 'El equipo, la instalación certificada RETIE y la puesta en marcha. Antes medimos tu acometida: si tu instalación no aguanta la potencia del cargador, te lo decimos y proponemos una alternativa más barata en vez de venderte algo que va a fallar.',
  },
  {
    q: '¿Las estaciones de carga son de AMPERIA?',
    a: 'Sí. Operamos nueve puntos propios en Bogotá: estaciones de carga rápida, estaciones solares en Suba y el Sur, y puntos gratis o para socios. Puedes verlos en tiempo real en el mapa de la app.',
  },
  {
    q: '¿La asesoría tiene costo?',
    a: 'La asesoría es gratis hoy y siempre. Si algún trabajo —estudio de carga, instalación— tiene costo, te lo decimos antes de empezar.',
  },
  {
    q: '¿Trabajan con todas las marcas de híbridos y eléctricos?',
    a: 'Sí. Trabajamos con todas las marcas presentes en Colombia, nuevos y usados, y con cualquier vehículo con conector Type 2, CCS2 o CHAdeMO.',
  },
  {
    q: '¿Qué tan rápido me contactan?',
    a: 'Respondemos el mismo día hábil. Te lee una persona, no un bot.',
  },
  {
    q: '¿Solo funcionan en Bogotá?',
    a: 'La red de estaciones está en Bogotá y La Calera. La asesoría, los repuestos y la planeación de rutas (Llano, Costa, Eje Cafetero) funcionan en todo el país.',
  },
  {
    q: '¿Qué incluye la tarjeta del plan mensual?',
    a: 'Descuento en cada recarga, carga gratis en estaciones solares, refacciones con prioridad y asesoría permanente. Los primeros socios entran con precio preferencial y no se cobra nada hasta el lanzamiento.',
  },
  {
    q: '¿Cómo funcionan los pagos en la app?',
    a: 'Puedes pagar con tarjeta débito o crédito, PSE o Nequi. Separar un vehículo cuesta $1.000.000 y es 100 % reembolsable si no cierras el negocio.',
  },
];

export const services = [
  {
    key: 'comprar',
    title: 'Comprar híbrido o eléctrico',
    body: 'Nuevos y usados, con precio de entrada y autonomía real de Bogotá.',
    cta: 'Ver catálogo',
    accent: 'teal' as const,
    icon: 'mci:car-electric-outline' as const,
    href: '/catalogo',
  },
  {
    key: 'cargador',
    title: 'Cargador para casa o empresa',
    body: 'Elegimos el que tu instalación sí soporta y lo dejamos certificado.',
    cta: 'Ver cargadores',
    accent: 'blue' as const,
    icon: 'zap' as const,
    href: '/tienda',
  },
  {
    key: 'estaciones',
    title: 'Cargar en nuestras estaciones',
    body: 'Nueve puntos propios en Bogotá, con rápidas, solares y gratis.',
    cta: 'Ver el mapa',
    accent: 'pink' as const,
    icon: 'mci:ev-station' as const,
    href: '/mapa',
  },
  {
    key: 'repuestos',
    title: 'Repuestos y refacciones',
    body: 'La pieza difícil, sin esperar semanas.',
    cta: 'Busco un repuesto',
    accent: 'violet' as const,
    icon: 'tool' as const,
    href: '/cotizacion?tipo=repuesto',
  },
  {
    key: 'asesoria',
    title: 'Asesoría para decidir bien',
    body: 'Qué comprar, Pico y Placa, postventa y rutas fuera de la ciudad.',
    cta: 'Pedir asesoría',
    accent: 'amber' as const,
    icon: 'compass' as const,
    href: '/cotizacion?tipo=asesoria',
  },
  {
    key: 'socio',
    title: 'Tarjeta de socio',
    body: 'Descuento en cada recarga y asesoría permanente. Próximamente.',
    cta: 'Quiero la tarjeta',
    accent: 'teal' as const,
    icon: 'credit-card' as const,
    href: '/tienda',
  },
];

export const hotspots = [
  {
    key: 'motor',
    label: 'Motor eléctrico',
    title: 'Hasta 40 % del ahorro',
    body: 'En trancón mueve el carro solo, sin quemar gasolina. Ahí está la plata.',
    tip: 'Pregunta por potencia eléctrica y hasta qué velocidad va solo.',
    color: '#2EE6C5',
    x: 0.3,
    y: 0.62,
  },
  {
    key: 'bateria',
    label: 'Batería',
    title: 'El corazón del ahorro',
    body: 'Guarda la energía que recuperas y la que cargas. Su salud define el valor de un usado.',
    tip: 'En usados pide el reporte de salud de batería (SOH).',
    color: '#3B82F6',
    x: 0.5,
    y: 0.64,
  },
  {
    key: 'frenado',
    label: 'Frenado regenerativo',
    title: 'Cada bajada carga',
    body: 'Al frenar o bajar, el motor actúa como generador. En Bogotá, con tantas subidas y bajadas, se nota.',
    tip: 'Prueba el modo de una sola pedalada si lo tiene.',
    color: '#8B5CF6',
    x: 0.77,
    y: 0.7,
  },
  {
    key: 'conector',
    label: 'Conector de carga',
    title: 'Type 2 y CCS2',
    body: 'Type 2 para carga en casa y AC; CCS2 para carga rápida DC en nuestras estaciones.',
    tip: 'Verifica que tu carro acepte CCS2 si viajas seguido.',
    color: '#EC4899',
    x: 0.12,
    y: 0.5,
  },
];

export const stats = [
  {
    value: 61,
    prefix: '+',
    suffix: '%',
    label: 'crecimiento de matrículas de híbridos en Colombia en 2026',
    accent: 'teal' as const,
    icon: 'trending-up' as const,
  },
  {
    value: 15800,
    prefix: '$',
    suffix: '',
    label: 'precio promedio del galón de gasolina',
    accent: 'blue' as const,
    icon: 'droplet' as const,
  },
  {
    value: 2600,
    prefix: '',
    suffix: ' m',
    label: 'altitud de Bogotá: menos aire, más consumo',
    accent: 'pink' as const,
    icon: 'triangle' as const,
  },
];

export const reasons = [
  { title: 'Ahorras tiempo', body: 'Una llamada en vez de diez.', icon: 'clock' as const, accent: 'teal' as const },
  { title: 'Contacto directo', body: 'Hablas con la persona, no con un formulario.', icon: 'users' as const, accent: 'blue' as const },
  { title: 'Datos de Bogotá', body: 'Altitud, subidas y tráfico real por corredor.', icon: 'map-pin' as const, accent: 'violet' as const },
  { title: 'Gratis para ti', body: 'Conectar no cuesta. Nunca.', icon: 'gift' as const, accent: 'pink' as const },
];

export const steps = [
  { title: 'Nos cuentas qué necesitas', body: 'Un mensaje corto y ya sabemos qué preguntar.' },
  { title: 'Te conectamos', body: 'Con el vendedor, taller o electrolinera que corresponde.' },
  { title: 'Cierras directo', body: 'Negocias con ellos. No tocamos el precio.' },
];
