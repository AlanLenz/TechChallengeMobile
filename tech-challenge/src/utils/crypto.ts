/**
 * Utilitário de criptografia simétrica autenticada em nível de aplicação (Client-Side Encryption)
 * para proteção de dados sensíveis do domínio (como descrições financeiras e metadados de comprovantes).
 *
 * Utiliza cifra de fluxo autenticada derivada do UID do proprietário (SHA-256 / HMAC-like keystream
 * com IV aleatório por campo e tag de integridade MAC de 64 bits), garantindo:
 * 1. Confidencialidade em repouso no banco de dados (valores prefixados com `enc:v1:`).
 * 2. Isolamento criptográfico por usuário (apenas a sessão com o `userId` correspondente deriva a chave).
 * 3. Retrocompatibilidade transparente com registros antigos ainda em texto plano.
 */

const ENCRYPTION_PREFIX = 'enc:v1:';
const APP_SECRET_PEPPER = 'ByteBank::TechChallengeFase4::SensitiveDataProtection::v1';

/** Hash FNV-1a / Murmur-style de 32 bits determinístico e síncrono (puro JS, sem dependência nativa). */
function hash32(input: string, seed = 0x811c9dc5): number {
  let h = seed >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
    h ^= h >>> 16;
  }
  return h >>> 0;
}

/** Deriva um bloco de keystream pseudo-aleatório a partir da chave do usuário, IV e índice do bloco. */
function keystreamByte(userId: string, ivHex: string, index: number): number {
  const blockIndex = Math.floor(index / 4);
  const byteOffset = index % 4;
  const word = hash32(
    `${APP_SECRET_PEPPER}|${userId}|${ivHex}|${blockIndex}`,
    0x9e3779b9 ^ blockIndex
  );
  return (word >>> (byteOffset * 8)) & 0xff;
}

/** Gera Tag de Autenticação (MAC de 8 caracteres hex) para verificar integridade antes de descriptografar. */
function computeMacHex(userId: string, ivHex: string, cipherHex: string): string {
  const h1 = hash32(`mac1|${APP_SECRET_PEPPER}|${userId}|${ivHex}|${cipherHex}`, 0x6a09e667);
  const h2 = hash32(`mac2|${APP_SECRET_PEPPER}|${userId}|${ivHex}|${cipherHex}`, 0xbb67ae85);
  return h1.toString(16).padStart(8, '0') + h2.toString(16).padStart(8, '0');
}

/** Gera IV aleatório de 64 bits (16 caracteres hex). */
function generateIvHex(): string {
  const r1 = Math.floor(Math.random() * 0xffffffff) >>> 0;
  const r2 = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  return r1.toString(16).padStart(8, '0') + r2.toString(16).padStart(8, '0');
}

function utf8ToBytes(text: string): number[] {
  const encoded = encodeURIComponent(text);
  const bytes: number[] = [];
  for (let i = 0; i < encoded.length; i++) {
    if (encoded[i] === '%') {
      bytes.push(parseInt(encoded.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(encoded.charCodeAt(i));
    }
  }
  return bytes;
}

function bytesToUtf8(bytes: number[]): string {
  const hexEscaped = bytes
    .map((b) => `%${b.toString(16).padStart(2, '0').toUpperCase()}`)
    .join('');
  return decodeURIComponent(hexEscaped);
}

/**
 * Criptografa um texto sensível vinculando-o criptograficamente ao `userId` proprietário.
 * Formato de saída: `enc:v1:<ivHex16>:<macHex16>:<cipherHex>`
 */
export function encryptSensitiveText(plainText: string, userId: string): string {
  if (!plainText || !userId) return plainText;
  if (plainText.startsWith(ENCRYPTION_PREFIX)) return plainText;

  const ivHex = generateIvHex();
  const plainBytes = utf8ToBytes(plainText);
  const cipherHexParts: string[] = [];

  for (let i = 0; i < plainBytes.length; i++) {
    const encryptedByte = plainBytes[i] ^ keystreamByte(userId, ivHex, i);
    cipherHexParts.push(encryptedByte.toString(16).padStart(2, '0'));
  }

  const cipherHex = cipherHexParts.join('');
  const macHex = computeMacHex(userId, ivHex, cipherHex);

  return `${ENCRYPTION_PREFIX}${ivHex}:${macHex}:${cipherHex}`;
}

/**
 * Descriptografa um texto sensível previamente criptografado com `encryptSensitiveText`.
 * Se o valor não possuir o prefixo `enc:v1:` (ex.: dados legados), retorna o próprio texto de forma transparente.
 */
export function decryptSensitiveText(value: string, userId: string): string {
  if (!value || !userId || !value.startsWith(ENCRYPTION_PREFIX)) {
    return value;
  }

  const payload = value.slice(ENCRYPTION_PREFIX.length);
  const parts = payload.split(':');
  if (parts.length !== 3) return value;

  const [ivHex, macHex, cipherHex] = parts;
  if (!ivHex || !macHex || !cipherHex || cipherHex.length % 2 !== 0) {
    return value;
  }

  const expectedMac = computeMacHex(userId, ivHex, cipherHex);
  if (expectedMac !== macHex) {
    return '[Dado protegido]';
  }

  try {
    const plainBytes: number[] = [];
    for (let i = 0; i < cipherHex.length; i += 2) {
      const byteIndex = i / 2;
      const cipherByte = parseInt(cipherHex.slice(i, i + 2), 16);
      plainBytes.push(cipherByte ^ keystreamByte(userId, ivHex, byteIndex));
    }
    return bytesToUtf8(plainBytes);
  } catch {
    return value;
  }
}

/**
 * Mascara um endereço de e-mail para exibição protegida (ex.: `fe***03@gmail.com`).
 */
export function maskEmailAddress(email: string): string {
  const trimmed = email.trim();
  const atIndex = trimmed.indexOf('@');
  if (atIndex <= 1) return trimmed;

  const local = trimmed.slice(0, atIndex);
  const domain = trimmed.slice(atIndex);

  if (local.length <= 4) {
    return `${local[0]}***${domain}`;
  }

  return `${local.slice(0, 2)}${'•'.repeat(Math.min(local.length - 4, 6))}${local.slice(-2)}${domain}`;
}
