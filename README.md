# AMPERIA · App móvil (iOS y Android)

App de AMPERIA hecha con **Expo (React Native, SDK 58)** y **Expo Router**. Usa la paleta verde de la web y el logo violeta sólo en la bienvenida, el ícono y el splash.

## Qué incluye

| Pestaña / pantalla | Funciones |
| --- | --- |
| **Bienvenida** | Logo animado (vector, nítido en cualquier resolución), inicio de sesión o registro |
| **Inicio** | Hero con parallax, estadísticas animadas, "¿Qué estás buscando?", destacados, "Toca el carro" interactivo, proceso, membresía y contacto |
| **Catálogo** | 21 modelos híbridos, mild hybrid, enchufables y eléctricos (nuevos y usados), búsqueda, filtros por tipo y precio, orden, favoritos |
| **Detalle del vehículo** | Selector de color en vivo, ficha técnica, ahorro mensual con deslizador, **separar el carro pagando $1.000.000**, cotizar, agendar prueba, WhatsApp |
| **Estaciones** | Mapa real (Google Maps en Android, Apple Maps en iOS) con las 9 estaciones, filtros, **"Cerca de mí" con GPS**, disponibilidad, cómo llegar y favoritas |
| **Tienda** | Wallbox 7 kW / 11 kW, estación comercial 22 kW, instalación RETIE, estudio de carga, accesorios, tarjeta de socio y recargas de saldo con bono |
| **Cuenta** | Registro e inicio de sesión, perfil editable, saldo, pedidos, cotizaciones, pruebas de manejo y favoritos |
| **Flujos** | Calculadora de ahorro (ajustada a 2.600 m), cotización con validación, agenda de pruebas, carrito, **pago con tarjeta / PSE / Nequi**, confirmación animada, preguntas frecuentes |

Detalles de interacción: rebote y vibración al tocar, transiciones entre pantallas, listas que se reacomodan con animación, toasts, contadores animados, tarjeta de socio holográfica y check de pago dibujado.

## Probarla en tu celular

```bash
npm install
npx expo start
```

Escanea el QR con **Expo Go** (Android) o con la cámara (iOS). Todos los módulos que usa la app vienen incluidos en Expo Go.

Vista rápida en el navegador: `npx expo start --web` (en web el mapa es una ilustración, porque el mapa real sólo funciona en iOS y Android).

## Compilar para las tiendas

```bash
npx eas-cli@latest build --platform android   # .aab / .apk
npx eas-cli@latest build --platform ios       # requiere cuenta de Apple Developer
```

## Antes de publicar: configura esto

Todo está en **`src/lib/config.ts`** y **`app.json`**:

1. **WhatsApp**: cambia `whatsappNumber` (formato `57300…`, sin `+`).
2. **Google Maps (Android)**: en `app.json` reemplaza `REEMPLAZA_CON_TU_API_KEY_DE_GOOGLE_MAPS` por una API key de Google Cloud con *Maps SDK for Android* activo. iOS usa Apple Maps y no necesita llave.
3. **Pagos**: hoy `paymentMode: 'demo'` **no cobra** (simula la pasarela; la tarjeta `4242 4242 4242 4242` se aprueba y una terminada en `0002` se rechaza). Para cobrar de verdad con **Wompi**:
   - Crea un endpoint en tu servidor que reciba `{ amountInCents, currency, email }`, genere una referencia única y la **firma de integridad** (`SHA256(referencia + monto + moneda + llave_de_integridad)`), y devuelva `{ reference, signature }`.
   - Pon esa URL en `paymentsApiUrl`, tu llave pública en `wompiPublicKey` y cambia `paymentMode` a `'wompi'`.
   - Confirma el estado final con el *webhook* de Wompi en tu servidor. **Nunca** pongas la llave privada ni la de integridad dentro de la app.
4. **Cuentas de usuario**: ahora se guardan **en el dispositivo** (contraseña con hash SHA-256 y sal, sesión en Keychain / Keystore), así que la app funciona completa sin servidor. Para que los usuarios entren desde varios celulares y tú veas pedidos y cotizaciones, reemplaza `authApi` en `src/lib/auth.tsx` y la persistencia de `src/lib/store.tsx` por tu backend (Supabase, Firebase o una API propia). La interfaz ya está separada para hacer ese cambio sin tocar las pantallas.
5. **Catálogo, estaciones y precios**: edita `src/data/vehicles.ts`, `src/data/stations.ts` y `src/data/products.ts`. Los precios de vehículos son **de referencia** y las coordenadas de estaciones son aproximadas.

## Estructura

```
src/
  app/                 Pantallas (Expo Router: cada archivo es una ruta)
    (tabs)/            Inicio, Catálogo, Estaciones, Tienda, Cuenta
    vehiculo/[id].tsx  Detalle del vehículo
    calculadora, cotizacion, agendar, carrito, checkout, pago-exitoso, login, registro, faq, pedidos
  components/          Ilustración vectorial de carros, mapa, tarjetas, UI base (botones, chips, campos, toasts…)
  data/                Vehículos, estaciones, productos y textos
  lib/                 Tema, cuentas, carrito/pedidos, pagos, calculadora, configuración
scripts/               Generador de íconos y splash a partir del logo vectorial
```

Íconos y splash: `npm run assets:generate` (requiere Playwright) los regenera en 1024 px desde el logo vectorial.

## Comandos útiles

```bash
npm run typecheck      # TypeScript
npx prettier --check "src/**/*.{ts,tsx}"
```
