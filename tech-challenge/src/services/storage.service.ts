import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * expo-secure-store tem limite de ~2048 bytes por valor. O blob de sessão do Firebase Auth
 * (access token + refresh token + metadata) pode ultrapassar isso — por isso valores grandes
 * são fatiados em múltiplas chaves (`${key}__0`, `${key}__1`, ...) de forma transparente.
 */
const CHUNK_SIZE = 1800;
const MANIFEST_SUFFIX = '__chunks';

async function getChunkCount(key: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(`${key}${MANIFEST_SUFFIX}`);
  return raw ? Number(raw) : 0;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  const previousCount = await getChunkCount(key);

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  await Promise.all(chunks.map((chunk, index) => SecureStore.setItemAsync(`${key}__${index}`, chunk)));
  await SecureStore.setItemAsync(`${key}${MANIFEST_SUFFIX}`, String(chunks.length));

  const staleChunks = Array.from(
    { length: Math.max(previousCount - chunks.length, 0) },
    (_, offset) => chunks.length + offset
  );
  await Promise.all(staleChunks.map((index) => SecureStore.deleteItemAsync(`${key}__${index}`)));
}

async function getSecureItem(key: string): Promise<string | null> {
  const count = await getChunkCount(key);
  if (count === 0) return null;

  const chunks = await Promise.all(
    Array.from({ length: count }, (_, index) => SecureStore.getItemAsync(`${key}__${index}`))
  );

  if (chunks.some((chunk) => chunk === null)) return null;
  return chunks.join('');
}

async function removeSecureItem(key: string): Promise<void> {
  const count = await getChunkCount(key);
  await Promise.all(
    Array.from({ length: count }, (_, index) => SecureStore.deleteItemAsync(`${key}__${index}`))
  );
  await SecureStore.deleteItemAsync(`${key}${MANIFEST_SUFFIX}`);
}

/** Dados sensíveis (tokens de sessão) — usado por src/firebase/auth.ts. */
export const secureStorage = {
  getItem: getSecureItem,
  setItem: setSecureItem,
  removeItem: removeSecureItem,
};

/** Preferências não sensíveis (tema escolhido, onboarding visto, etc.). */
export const preferencesStorage = {
  getItem: (key: string) => AsyncStorage.getItem(key),
  setItem: (key: string, value: string) => AsyncStorage.setItem(key, value),
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
