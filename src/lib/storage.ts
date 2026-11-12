import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export async function getJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setJSON(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // almacenamiento no disponible: la app sigue funcionando en memoria
  }
}

/** Valores sensibles (token de sesión) en Keychain / Keystore. En web cae a AsyncStorage. */
export const secure = {
  async get(key: string) {
    if (Platform.OS === 'web') return AsyncStorage.getItem(key).catch(() => null);
    return SecureStore.getItemAsync(key).catch(() => null);
  },
  async set(key: string, value: string) {
    if (Platform.OS === 'web') return AsyncStorage.setItem(key, value).catch(() => undefined);
    return SecureStore.setItemAsync(key, value).catch(() => undefined);
  },
  async remove(key: string) {
    if (Platform.OS === 'web') return AsyncStorage.removeItem(key).catch(() => undefined);
    return SecureStore.deleteItemAsync(key).catch(() => undefined);
  },
};
