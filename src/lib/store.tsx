import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import type { Accent } from './theme';
import { useAuth } from './auth';
import { uid } from './format';
import { getJSON, setJSON } from './storage';

export type CartItem = {
  key: string;
  kind: 'producto' | 'reserva';
  refId: string;
  name: string;
  subtitle: string;
  unitPrice: number;
  qty: number;
  accent: Accent;
  walletCredit?: number;
  maxQty?: number;
};

export type PaymentMethod = 'tarjeta' | 'pse' | 'nequi';

export type Order = {
  id: string;
  reference: string;
  createdAt: string;
  items: CartItem[];
  total: number;
  method: PaymentMethod;
  status: 'aprobado' | 'pendiente';
};

export type QuoteType = 'vehiculo' | 'cargador' | 'repuesto' | 'asesoria' | 'socio' | 'estaciones';

export type Quote = {
  id: string;
  createdAt: string;
  type: QuoteType;
  vehicleId?: string;
  name: string;
  contact: string;
  message: string;
  status: 'recibida' | 'en-contacto';
};

export type TestDrive = {
  id: string;
  createdAt: string;
  vehicleId: string;
  date: string;
  slot: string;
  place: 'concesionario' | 'domicilio';
};

type Data = {
  favoriteVehicles: string[];
  favoriteStations: string[];
  cart: CartItem[];
  orders: Order[];
  quotes: Quote[];
  testDrives: TestDrive[];
  wallet: number;
  onboarded: boolean;
};

const empty: Data = {
  favoriteVehicles: [],
  favoriteStations: [],
  cart: [],
  orders: [],
  quotes: [],
  testDrives: [],
  wallet: 0,
  onboarded: false,
};

const keyFor = (owner: string) => `amperia.data.v1.${owner}`;

type Store = Data & {
  loaded: boolean;
  cartCount: number;
  cartTotal: number;
  isFavorite: (kind: 'vehicle' | 'station', id: string) => boolean;
  toggleFavorite: (kind: 'vehicle' | 'station', id: string) => boolean;
  addToCart: (item: Omit<CartItem, 'key' | 'qty'> & { qty?: number }) => void;
  setQty: (key: string, qty: number) => void;
  removeFromCart: (key: string) => void;
  clearCart: () => void;
  placeOrder: (method: PaymentMethod, reference: string) => Order;
  addQuote: (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => Quote;
  addTestDrive: (t: Omit<TestDrive, 'id' | 'createdAt'>) => TestDrive;
  setOnboarded: () => void;
};

const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const { user, ready } = useAuth();
  const owner = user?.id ?? 'guest';
  const [data, setData] = useState<Data>(empty);
  // Dueño cuyos datos están cargados en memoria. Mientras no coincida con `owner` no se guarda nada,
  // para no escribir los datos de una cuenta sobre los de otra al iniciar o cerrar sesión.
  const [loadedOwner, setLoadedOwner] = useState<string | null>(null);
  const loaded = loadedOwner === owner;
  const prevOwner = useRef<string | null>(null);

  // Carga los datos del dueño actual; al iniciar sesión se traen carrito y favoritos del invitado.
  useEffect(() => {
    if (!ready) return;
    let cancelled = false;
    (async () => {
      const own = await getJSON<Data>(keyFor(owner), empty);
      let next: Data = { ...empty, ...own };
      if (prevOwner.current === 'guest' && owner !== 'guest') {
        const guest = await getJSON<Data>(keyFor('guest'), empty);
        next = {
          ...next,
          onboarded: true,
          cart: mergeCart(next.cart, guest.cart),
          favoriteVehicles: Array.from(new Set([...next.favoriteVehicles, ...guest.favoriteVehicles])),
          favoriteStations: Array.from(new Set([...next.favoriteStations, ...guest.favoriteStations])),
        };
        await setJSON(keyFor('guest'), { ...guest, cart: [] });
      }
      if (owner === 'guest' && prevOwner.current && prevOwner.current !== 'guest') next.onboarded = true;
      prevOwner.current = owner;
      if (!cancelled) {
        setData(next);
        setLoadedOwner(owner);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [owner, ready]);

  useEffect(() => {
    if (loadedOwner) setJSON(keyFor(loadedOwner), data);
  }, [data, loadedOwner]);

  const update = useCallback((fn: (d: Data) => Data) => setData((d) => fn(d)), []);

  const isFavorite = useCallback(
    (kind: 'vehicle' | 'station', id: string) => (kind === 'vehicle' ? data.favoriteVehicles : data.favoriteStations).includes(id),
    [data.favoriteVehicles, data.favoriteStations],
  );

  const toggleFavorite = useCallback(
    (kind: 'vehicle' | 'station', id: string) => {
      const field = kind === 'vehicle' ? 'favoriteVehicles' : 'favoriteStations';
      const willAdd = !data[field].includes(id);
      update((d) => ({ ...d, [field]: willAdd ? [...d[field], id] : d[field].filter((x) => x !== id) }));
      return willAdd;
    },
    [data, update],
  );

  const addToCart: Store['addToCart'] = useCallback(
    (item) =>
      update((d) => {
        const existing = d.cart.find((c) => c.refId === item.refId && c.kind === item.kind);
        if (existing) {
          const max = existing.maxQty ?? 99;
          return {
            ...d,
            cart: d.cart.map((c) => (c === existing ? { ...c, qty: Math.min(max, c.qty + (item.qty ?? 1)) } : c)),
          };
        }
        return { ...d, cart: [...d.cart, { ...item, qty: item.qty ?? 1, key: uid('C') }] };
      }),
    [update],
  );

  const setQty = useCallback(
    (key: string, qty: number) =>
      update((d) => ({
        ...d,
        cart: d.cart.map((c) => (c.key === key ? { ...c, qty: Math.min(c.maxQty ?? 99, qty) } : c)).filter((c) => c.qty > 0),
      })),
    [update],
  );

  const removeFromCart = useCallback((key: string) => update((d) => ({ ...d, cart: d.cart.filter((c) => c.key !== key) })), [update]);

  const clearCart = useCallback(() => update((d) => ({ ...d, cart: [] })), [update]);

  const placeOrder = useCallback(
    (method: PaymentMethod, reference: string) => {
      const order: Order = {
        id: uid('AMP-'),
        reference,
        createdAt: new Date().toISOString(),
        items: data.cart,
        total: data.cart.reduce((s, c) => s + c.unitPrice * c.qty, 0),
        method,
        status: 'aprobado',
      };
      const credit = data.cart.reduce((s, c) => s + (c.walletCredit ?? 0) * c.qty, 0);
      update((d) => ({ ...d, cart: [], orders: [order, ...d.orders], wallet: d.wallet + credit }));
      return order;
    },
    [data.cart, update],
  );

  const addQuote = useCallback(
    (q: Omit<Quote, 'id' | 'createdAt' | 'status'>) => {
      const quote: Quote = { ...q, id: uid('COT-'), createdAt: new Date().toISOString(), status: 'recibida' };
      update((d) => ({ ...d, quotes: [quote, ...d.quotes] }));
      return quote;
    },
    [update],
  );

  const addTestDrive = useCallback(
    (t: Omit<TestDrive, 'id' | 'createdAt'>) => {
      const td: TestDrive = { ...t, id: uid('PRB-'), createdAt: new Date().toISOString() };
      update((d) => ({ ...d, testDrives: [td, ...d.testDrives] }));
      return td;
    },
    [update],
  );

  const setOnboarded = useCallback(() => update((d) => ({ ...d, onboarded: true })), [update]);

  const value = useMemo<Store>(
    () => ({
      ...data,
      loaded,
      cartCount: data.cart.reduce((s, c) => s + c.qty, 0),
      cartTotal: data.cart.reduce((s, c) => s + c.qty * c.unitPrice, 0),
      isFavorite,
      toggleFavorite,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      placeOrder,
      addQuote,
      addTestDrive,
      setOnboarded,
    }),
    [
      data,
      loaded,
      isFavorite,
      toggleFavorite,
      addToCart,
      setQty,
      removeFromCart,
      clearCart,
      placeOrder,
      addQuote,
      addTestDrive,
      setOnboarded,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

function mergeCart(a: CartItem[], b: CartItem[]) {
  const out = [...a];
  for (const item of b) {
    const same = out.find((x) => x.refId === item.refId && x.kind === item.kind);
    if (same) same.qty = Math.min(same.maxQty ?? 99, same.qty + item.qty);
    else out.push(item);
  }
  return out;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore debe usarse dentro de <StoreProvider>');
  return ctx;
}
