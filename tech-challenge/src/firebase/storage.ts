import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  type FirebaseStorage,
  type UploadMetadata,
} from 'firebase/storage';

import { getFirebaseApp } from './config';

let storageInstance: FirebaseStorage | undefined;

function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
  }

  return storageInstance;
}

export async function uploadFile(
  path: string,
  blob: Blob,
  metadata?: UploadMetadata
): Promise<string> {
  await uploadBytes(
    ref(getStorageInstance(), path),
    blob,
    metadata
  );

  return path;
}

export async function getFileUrl(
  path: string
): Promise<string> {
  return getDownloadURL(
    ref(getStorageInstance(), path)
  );
}

export async function deleteFile(
  path: string
): Promise<void> {
  await deleteObject(
    ref(getStorageInstance(), path)
  );
}

/**
 * Traduz os códigos de erro do Firebase Storage em mensagens de domínio — mesmo padrão de
 * `getAuthErrorMessage` em `./auth.ts`, para os services não vazarem string crua do SDK.
 */
export function getStorageErrorMessage(error: unknown): string {
  if (error != null && typeof error === 'object' && 'code' in error) {
    const code = (error as { code: string }).code;

    const messages: Record<string, string> = {
      'storage/unauthorized': 'Você não tem permissão para enviar este arquivo.',
      'storage/canceled': 'Envio cancelado.',
      'storage/retry-limit-exceeded': 'Falha de conexão ao enviar o arquivo. Tente novamente.',
      'storage/quota-exceeded': 'Limite de armazenamento excedido.',
      'storage/object-not-found': 'Arquivo não encontrado.',
      'storage/unauthenticated': 'Sessão expirada. Entre novamente para enviar o arquivo.',
    };

    return messages[code] ?? `Não foi possível enviar o arquivo (${code}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Não foi possível enviar o arquivo.';
}
