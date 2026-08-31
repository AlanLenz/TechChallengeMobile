import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  reload,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
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

export async function resetPassword(
  email: string
): Promise<void> {
  await sendPasswordResetEmail(
    getAuthInstance(),
    email
  );
}

export function getAuthErrorMessage(error: unknown): string {
  if (
    error != null &&
    typeof error === 'object' &&
    'code' in error
  ) {
    const code = (error as { code: string }).code;

    const messages: Record<string, string> = {
      'auth/invalid-email':
        'E-mail inválido.',

      'auth/user-disabled':
        'Esta conta foi desativada.',

      'auth/user-not-found':
        'Usuário não encontrado.',

      'auth/wrong-password':
        'Senha incorreta.',

      'auth/email-already-in-use':
        'Este e-mail já está em uso.',

      'auth/weak-password':
        'A senha deve ter pelo menos 6 caracteres.',

      'auth/network-request-failed':
        'Erro de rede. Verifique sua conexão.',

      'auth/too-many-requests':
        'Muitas tentativas. Tente novamente mais tarde.',

      'auth/operation-not-allowed':
        'Operação não permitida.',

      'auth/invalid-credential':
        'E-mail ou senha incorretos.',
    };

    return messages[code] ?? `Erro de autenticação (${code}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}

