/**
 * Configuración del negocio. Cambia estos valores antes de publicar la app.
 */
export const config = {
  /** Número de WhatsApp en formato internacional, sin "+" ni espacios. */
  whatsappNumber: '573000000000',
  supportEmail: 'hola@amperia.co',
  city: 'Bogotá',

  /**
   * Pagos:
   *  - 'demo': simula la pasarela (no cobra). Útil para pruebas y presentaciones.
   *  - 'wompi': abre el Web Checkout de Wompi. Requiere un backend que firme la transacción
   *    (la llave de integridad NUNCA debe ir dentro de la app). Ver README.
   */
  paymentMode: 'demo' as 'demo' | 'wompi',
  wompiPublicKey: 'pub_test_REEMPLAZAR',
  /** Endpoint de tu backend que devuelve { reference, signature } para Wompi. */
  paymentsApiUrl: 'https://api.tu-dominio.co/payments/wompi/session',
  paymentRedirectUrl: 'amperia://pago-exitoso',
};

export function whatsappUrl(message: string) {
  return `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
