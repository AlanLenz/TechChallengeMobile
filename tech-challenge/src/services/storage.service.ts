import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

/**
 * expo-secure-store tem limite de ~2048 bytes por valor. O blob de sessão do Firebase Auth
 * (access token + refresh token + metadata) pode ultrapassar isso — por isso valores grandes
 * são fatiados em múltiplas chaves (`${key}__0`, `${key}__1`, ...) de forma transparente.
 *
 * `WHEN_UNLOCKED_THIS_DEVICE_ONLY` garante que os dados criptografados pelo Keychain (iOS) /
 * Keystore (Android) só fiquem acessíveis com o dispositivo desbloqueado e nunca sejam migrados
 * em backups para outros aparelhos.
 */
const CHUNK_SIZE = 1800;
const MANIFEST_SUFFIX = '__chunks';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

/**
 * O `expo-secure-store` aceita apenas caracteres alfanuméricos, `.`, `-` e `_` nas chaves.
 * Como o Firebase Auth gera chaves no formato `firebase:authUser:<apiKey>:[DEFAULT]` (contendo
 * `:` e `[`/`]`), normalizamos qualquer caractere fora do padrão antes de acessar o Keychain/Keystore.
 */
function sanitizeSecureStoreKey(key: string): string {
  const sanitized = key.replace(/[^a-zA-Z0-9._-]/g, '_');
  return sanitized.length > 0 ? sanitized : '_empty_key';
}

async function getChunkCount(safeKey: string): Promise<number> {
  const raw = await SecureStore.getItemAsync(`${safeKey}${MANIFEST_SUFFIX}`, SECURE_STORE_OPTIONS);
  return raw ? Number(raw) : 0;
}

async function setSecureItem(key: string, value: string): Promise<void> {
  const safeKey = sanitizeSecureStoreKey(key);
  const previousCount = await getChunkCount(safeKey);

  const chunks: string[] = [];
  for (let i = 0; i < value.length; i += CHUNK_SIZE) {
    chunks.push(value.slice(i, i + CHUNK_SIZE));
  }

  await Promise.all(
    chunks.map((chunk, index) =>
      SecureStore.setItemAsync(`${safeKey}__${index}`, chunk, SECURE_STORE_OPTIONS)
    )
  );
  await SecureStore.setItemAsync(
    `${safeKey}${MANIFEST_SUFFIX}`,
    String(chunks.length),
    SECURE_STORE_OPTIONS
  );

  const staleChunks = Array.from(
    { length: Math.max(previousCount - chunks.length, 0) },
    (_, offset) => chunks.length + offset
  );
  await Promise.all(
    staleChunks.map((index) =>
      SecureStore.deleteItemAsync(`${safeKey}__${index}`, SECURE_STORE_OPTIONS)
    )
  );
}

async function getSecureItem(key: string): Promise<string | null> {
  const safeKey = sanitizeSecureStoreKey(key);
  const count = await getChunkCount(safeKey);
  if (count === 0) return null;

  const chunks = await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.getItemAsync(`${safeKey}__${index}`, SECURE_STORE_OPTIONS)
    )
  );

  if (chunks.some((chunk) => chunk === null)) return null;
  return chunks.join('');
}

async function removeSecureItem(key: string): Promise<void> {
  const safeKey = sanitizeSecureStoreKey(key);
  const count = await getChunkCount(safeKey);
  await Promise.all(
    Array.from({ length: count }, (_, index) =>
      SecureStore.deleteItemAsync(`${safeKey}__${index}`, SECURE_STORE_OPTIONS)
    )
  );
  await SecureStore.deleteItemAsync(`${safeKey}${MANIFEST_SUFFIX}`, SECURE_STORE_OPTIONS);
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
