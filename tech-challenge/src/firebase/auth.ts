import {
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  onAuthStateChanged,
  reload,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type Auth,
  type User,
} from 'firebase/auth';
import { Platform } from 'react-native';

import { secureStorage } from '@/services/storage.service';
import { getFirebaseApp } from './config';

export type { User };

let authInstance: Auth | undefined;

function getAuthInstance(): Auth {
  if (!authInstance) {
    const app = getFirebaseApp();
    try {
      if (Platform.OS !== 'web') {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { getReactNativePersistence } = require('firebase/auth');
        if (typeof getReactNativePersistence === 'function') {
          authInstance = initializeAuth(app, {
            persistence: getReactNativePersistence(secureStorage),
          });
        } else {
          authInstance = getAuth(app);
        }
      } else {
        authInstance = getAuth(app);
      }
    } catch {
      // Instância já inicializada previamente (HMR / Fast Refresh)
      authInstance = getAuth(app);
    }
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

  try {
    await firebaseSendEmailVerification(result.user);
  } catch (error) {
    console.warn('[Auth] Não foi possível enviar e-mail de verificação automático:', error);
  }

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

export async function sendVerificationEmail(): Promise<void> {
  const user = getAuthInstance().currentUser;
  if (!user) {
    throw new Error('Nenhum usuário autenticado.');
  }

  await firebaseSendEmailVerification(user);
}

export async function updateCurrentUserProfile(
  data: { displayName?: string; photoURL?: string }
): Promise<void> {
  const user = getAuthInstance().currentUser;

  if (!user) return;

  await updateProfile(user, data);
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
        'Esta conta foi desativada temporariamente.',

      // Defesa contra enumeração de usuários (OWASP ASVS):
      // Mensagem unificada para usuário não encontrado e senha incorreta
      'auth/user-not-found':
        'E-mail ou senha incorretos.',

      'auth/wrong-password':
        'E-mail ou senha incorretos.',

      'auth/invalid-credential':
        'E-mail ou senha incorretos.',

      'auth/email-already-in-use':
        'Este e-mail já está em uso.',

      'auth/weak-password':
        'A senha é muito fraca. Deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas e números.',

      'auth/network-request-failed':
        'Erro de rede. Verifique sua conexão.',

      'auth/too-many-requests':
        'Muitas tentativas sem sucesso. Por segurança, aguarde alguns instantes antes de tentar novamente.',

      'auth/operation-not-allowed':
        'Operação não permitida.',
    };

    return messages[code] ?? `Erro de autenticação (${code}).`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocorreu um erro inesperado.';
}
