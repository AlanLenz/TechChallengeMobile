import {
  createUserWithEmailAndPassword,
  initializeAuth,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
// `getReactNativePersistence` existe e funciona em runtime (build React Native do SDK,
// resolvido pelo Metro via a condição "react-native" do @firebase/auth), mas o pacote
// `firebase` não reexporta o tipo certo nesta versão — problema conhecido e ainda aberto:
// https://github.com/firebase/firebase-js-sdk/issues/8332
// @ts-expect-error — ver comentário acima.
import { getReactNativePersistence } from 'firebase/auth';

import { secureStorage } from '@/services/storage.service';

import { getFirebaseApp } from './config';

export type { User };

let authInstance: Auth | undefined;

function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = initializeAuth(getFirebaseApp(), {
      persistence: getReactNativePersistence(secureStorage),
    });
  }
  return authInstance;
}

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'E-mail inválido.',
  'auth/invalid-credential': 'Credenciais inválidas.',
  'auth/wrong-password': 'Credenciais inválidas.',
  'auth/user-not-found': 'Credenciais inválidas.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
  'auth/weak-password': 'A senha precisa ter pelo menos 6 caracteres.',
  'auth/network-request-failed': 'Falha de conexão. Verifique sua internet.',
  'auth/too-many-requests': 'Muitas tentativas. Tente novamente mais tarde.',
};

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | undefined)?.code;
  return (code && ERROR_MESSAGES[code]) ?? 'Não foi possível concluir a operação. Tente novamente.';
}

export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(getAuthInstance(), email, password);
  return credential.user;
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const credential = await createUserWithEmailAndPassword(getAuthInstance(), email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(getAuthInstance(), email);
}

export function getCurrentUser(): User | null {
  return getAuthInstance().currentUser;
}

export async function updateCurrentUserProfile(update: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  const user = getCurrentUser();
  if (!user) throw new Error('Nenhum usuário autenticado.');
  await updateProfile(user, update);
}

/** Recarrega o usuário atual do Firebase (necessário após updateProfile, que não dispara onAuthStateChanged). */
export async function reloadCurrentUser(): Promise<User | null> {
  const user = getCurrentUser();
  if (user) await user.reload();
  return getAuthInstance().currentUser;
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(getAuthInstance(), callback);
}
