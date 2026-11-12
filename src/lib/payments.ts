import * as WebBrowser from 'expo-web-browser';

import { config } from './config';
import { uid } from './format';
import type { PaymentMethod } from './store';

export type PaymentRequest = {
  amount: number; // COP
  method: PaymentMethod;
  email: string;
  description: string;
  card?: { number: string; holder: string; expiry: string; cvc: string; installments: number };
  pseBank?: string;
  nequiPhone?: string;
};

export type PaymentResult = { status: 'approved' | 'declined' | 'pending' | 'cancelled'; reference: string; message?: string };

/** Algoritmo de Luhn para validar números de tarjeta. */
export function isValidCardNumber(num: string) {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let dbl = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

export function cardBrand(num: string): 'visa' | 'mastercard' | 'amex' | 'diners' | null {
  const d = num.replace(/\D/g, '');
  if (/^4/.test(d)) return 'visa';
  if (/^(5[1-5]|2[2-7])/.test(d)) return 'mastercard';
  if (/^3[47]/.test(d)) return 'amex';
  if (/^3(0[0-5]|[68])/.test(d)) return 'diners';
  return null;
}

export function isValidExpiry(exp: string) {
  const m = /^(\d{2})\/(\d{2})$/.exec(exp);
  if (!m) return false;
  const month = Number(m[1]);
  const year = 2000 + Number(m[2]);
  if (month < 1 || month > 12) return false;
  const end = new Date(year, month, 1);
  return end > new Date();
}

export const pseBanks = [
  'Bancolombia',
  'Banco de Bogotá',
  'Davivienda',
  'BBVA',
  'Banco de Occidente',
  'Banco Popular',
  'Scotiabank Colpatria',
  'Banco AV Villas',
  'Banco Caja Social',
  'Nu Colombia',
];

/**
 * Procesa un pago.
 * - Modo `demo`: simula la pasarela con una espera realista. Tarjetas terminadas en 0002 se rechazan
 *   para poder probar el flujo de error.
 * - Modo `wompi`: pide a tu backend la referencia firmada y abre el Web Checkout de Wompi.
 */
export async function processPayment(req: PaymentRequest): Promise<PaymentResult> {
  if (config.paymentMode === 'wompi') return payWithWompi(req);

  await new Promise((r) => setTimeout(r, 2200));
  const reference = uid('AMP');
  if (req.method === 'tarjeta' && req.card?.number.replace(/\D/g, '').endsWith('0002')) {
    return { status: 'declined', reference, message: 'Tu banco rechazó la transacción. Prueba con otra tarjeta.' };
  }
  return { status: 'approved', reference };
}

async function payWithWompi(req: PaymentRequest): Promise<PaymentResult> {
  const amountInCents = Math.round(req.amount * 100);
  const res = await fetch(config.paymentsApiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountInCents, currency: 'COP', email: req.email, description: req.description }),
  });
  if (!res.ok) return { status: 'declined', reference: '', message: 'No pudimos iniciar el pago. Intenta de nuevo.' };
  const { reference, signature } = (await res.json()) as { reference: string; signature: string };

  const params = new URLSearchParams({
    'public-key': config.wompiPublicKey,
    currency: 'COP',
    'amount-in-cents': String(amountInCents),
    reference,
    'signature:integrity': signature,
    'redirect-url': config.paymentRedirectUrl,
    'customer-data:email': req.email,
  });
  const result = await WebBrowser.openAuthSessionAsync(`https://checkout.wompi.co/p/?${params}`, config.paymentRedirectUrl);
  if (result.type !== 'success') return { status: 'cancelled', reference };
  // El estado definitivo debe confirmarse en tu backend con el webhook de Wompi.
  return { status: 'pending', reference };
}
