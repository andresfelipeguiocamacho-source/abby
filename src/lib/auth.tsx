import * as Crypto from 'expo-crypto';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { getJSON, secure, setJSON } from './storage';

/**
 * Cuentas de usuario.
 *
 * Esta implementación guarda las cuentas en el dispositivo (contraseña con hash SHA-256 + sal,
 * sesión en Keychain/Keystore) para que la app funcione completa sin servidor.
 * Para producción, reemplaza las funciones de `authApi` por llamadas a tu backend
 * (Supabase, Firebase o una API propia) manteniendo la misma interfaz.
 */
export type User = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
};

type StoredUser = User & { salt: string; hash: string };

const USERS_KEY = 'amperia.users.v1';
const SESSION_KEY = 'amperia.session.v1';

async function hashPassword(password: string, salt: string) {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${password}`);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export class AuthError extends Error {}

const authApi = {
  async register(input: { name: string; email: string; phone: string; password: string }): Promise<User> {
    const email = normalizeEmail(input.email);
    const users = await getJSON<Record<string, StoredUser>>(USERS_KEY, {});
    if (users[email]) throw new AuthError('Ya existe una cuenta con ese correo.');
    const salt = Crypto.randomUUID();
    const stored: StoredUser = {
      id: Crypto.randomUUID(),
      name: input.name.trim(),
      email,
      phone: input.phone.trim(),
      city: 'Bogotá',
      createdAt: new Date().toISOString(),
      salt,
      hash: await hashPassword(input.password, salt),
    };
    users[email] = stored;
    await setJSON(USERS_KEY, users);
    return strip(stored);
  },
  async login(emailRaw: string, password: string): Promise<User> {
    const email = normalizeEmail(emailRaw);
    const users = await getJSON<Record<string, StoredUser>>(USERS_KEY, {});
    const u = users[email];
    if (!u || (await hashPassword(password, u.salt)) !== u.hash) {
      throw new AuthError('Correo o contraseña incorrectos.');
    }
    return strip(u);
  },
  async getById(id: string): Promise<User | null> {
    const users = await getJSON<Record<string, StoredUser>>(USERS_KEY, {});
    const u = Object.values(users).find((x) => x.id === id);
    return u ? strip(u) : null;
  },
  async update(id: string, patch: Partial<Pick<User, 'name' | 'phone' | 'city'>>): Promise<User> {
    const users = await getJSON<Record<string, StoredUser>>(USERS_KEY, {});
    const entry = Object.entries(users).find(([, x]) => x.id === id);
    if (!entry) throw new AuthError('Cuenta no encontrada.');
    const next = { ...entry[1], ...patch };
    users[entry[0]] = next;
    await setJSON(USERS_KEY, users);
    return strip(next);
  },
};

function strip({ salt: _s, hash: _h, ...u }: StoredUser): User {
  return u;
}

type AuthState = {
  user: User | null;
  ready: boolean;
  register: typeof authApi.register;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<User, 'name' | 'phone' | 'city'>>) => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const id = await secure.get(SESSION_KEY);
      if (id) setUser(await authApi.getById(id));
      setReady(true);
    })();
  }, []);

  const register = useCallback<AuthState['register']>(async (input) => {
    const u = await authApi.register(input);
    await secure.set(SESSION_KEY, u.id);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authApi.login(email, password);
    await secure.set(SESSION_KEY, u.id);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(async () => {
    await secure.remove(SESSION_KEY);
    setUser(null);
  }, []);

  const updateProfile = useCallback<AuthState['updateProfile']>(
    async (patch) => {
      if (!user) return;
      setUser(await authApi.update(user.id, patch));
    },
    [user],
  );

  const value = useMemo(
    () => ({ user, ready, register, login, logout, updateProfile }),
    [user, ready, register, login, logout, updateProfile],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
