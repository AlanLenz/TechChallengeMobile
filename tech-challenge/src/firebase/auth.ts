import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
  type Auth,
} from 'firebase/auth';

import { getFirebaseApp } from './config';

export type { User };

let authInstance: Auth | undefined;

function getAuthInstance(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }

  return authInstance;
}

export function getCurrentUser(): User | null {
  return getAuthInstance().currentUser;
}

export async function signUp(
  name: string,
  email: string,
  password: string
) {
  const result = await createUserWithEmailAndPassword(
    getAuthInstance(),
    email,
    password
  );

  await updateProfile(result.user, {
    displayName: name,
  });

  return result;
}

export async function signIn(
  email: string,
  password: string
) {
  return signInWithEmailAndPassword(
    getAuthInstance(),
    email,
    password
  );
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(getAuthInstance());
}

export async function reloadCurrentUser(): Promise<User | null> {
  const user = getAuthInstance().currentUser;

  if (!user) {
    return null;
  }

  await reload(user);

  return getAuthInstance().currentUser;
}

export function subscribeToAuthChanges(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(
    getAuthInstance(),
    callback
  );
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(
    getAuthInstance(),
    email
  );
}

export function getAuthErrorMessage(error: unknown): string {
  if (
    typeof error !== 'object' ||
    error === null ||
    !('code' in error)
  ) {
    return 'Ocorreu um erro inesperado.';
  }

  const code = String(error.code);

  switch (code) {
    case 'auth/email-already-in-use':
      return 'Este e-mail já está cadastrado.';

    case 'auth/invalid-email':
      return 'O e-mail informado é inválido.';

    case 'auth/invalid-credential':
      return 'E-mail ou senha incorretos.';

    case 'auth/weak-password':
      return 'A senha precisa ter pelo menos 6 caracteres.';

    case 'auth/user-not-found':
      return 'Usuário não encontrado.';

    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente mais tarde.';

    default:
      return 'Não foi possível realizar a operação.';
  }
}