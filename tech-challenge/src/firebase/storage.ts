import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  type FirebaseStorage,
} from 'firebase/storage';

import { getFirebaseApp } from './config';

let storageInstance: FirebaseStorage | undefined;

function getStorageInstance(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(getFirebaseApp());
  }
  return storageInstance;
}

export async function uploadFile(path: string, blob: Blob): Promise<string> {
  await uploadBytes(ref(getStorageInstance(), path), blob);
  return path;
}

export async function getFileUrl(path: string): Promise<string> {
  return getDownloadURL(ref(getStorageInstance(), path));
}

export async function deleteFile(path: string): Promise<void> {
  await deleteObject(ref(getStorageInstance(), path));
}
