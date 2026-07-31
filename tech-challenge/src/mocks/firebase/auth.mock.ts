import type { AuthUser } from '@/firebase/auth.types';
import { MOCK_AUTH_ACCOUNTS, type MockAuthAccount } from '@/mocks/data';

/**
 * Implementação mockada de src/firebase/auth.ts — mesma interface exportada, dados em memória.
 * Ver src/firebase/auth.ts (o "picker" que escolhe entre este arquivo e auth.real.ts).
 */

const ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Credenciais inválidas.',
  'auth/email-already-in-use': 'Já existe uma conta com este e-mail.',
};

class MockAuthError extends Error {
  code: string;
  constructor(code: string) {
    super(code);
    this.code = code;
  }
}

// Contas registradas em memória: seed inicial + qualquer signUp() feito durante a sessão.
const accounts: MockAuthAccount[] = [...MOCK_AUTH_ACCOUNTS];
let currentAccount: MockAuthAccount | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

function toAuthUser(account: MockAuthAccount): AuthUser {
  return {
    uid: account.uid,
    email: account.email,
    displayName: account.displayName,
    photoURL: account.photoURL,
    reload: async () => {},
  };
}

function emit(): void {
  const user = currentAccount ? toAuthUser(currentAccount) : null;
  listeners.forEach((listener) => listener(user));
}

export function getAuthErrorMessage(error: unknown): string {
  const code = (error as { code?: string } | undefined)?.code;
  return (code && ERROR_MESSAGES[code]) ?? 'Não foi possível concluir a operação. Tente novamente.';
}

export async function signIn(email: string, password: string): Promise<AuthUser> {
  const account = accounts.find((candidate) => candidate.email === email && candidate.password === password);
  if (!account) throw new MockAuthError('auth/invalid-credential');

  currentAccount = account;
  emit();
  return toAuthUser(account);
}

export async function signUp(name: string, email: string, password: string): Promise<AuthUser> {
  if (accounts.some((candidate) => candidate.email === email)) {
    throw new MockAuthError('auth/email-already-in-use');
  }

  const account: MockAuthAccount = {
    uid: `mock-user-${Date.now()}`,
    email,
    password,
    displayName: name,
    photoURL: null,
  };
  accounts.push(account);
  currentAccount = account;
  emit();
  return toAuthUser(account);
}

export async function signOut(): Promise<void> {
  currentAccount = null;
  emit();
}

export async function resetPassword(email: string): Promise<void> {
  console.info(`[mock-auth] E-mail de redefinição de senha "enviado" para ${email}.`);
}

export function getCurrentUser(): AuthUser | null {
  return currentAccount ? toAuthUser(currentAccount) : null;
}

export async function updateCurrentUserProfile(update: {
  displayName?: string;
  photoURL?: string;
}): Promise<void> {
  if (!currentAccount) throw new Error('Nenhum usuário autenticado.');
  if (update.displayName !== undefined) currentAccount.displayName = update.displayName;
  if (update.photoURL !== undefined) currentAccount.photoURL = update.photoURL;
  // Assim como no Firebase real, updateProfile não dispara os listeners de auth state —
  // quem chamar isto precisa chamar reloadCurrentUser() para refletir a mudança na UI.
}

export async function reloadCurrentUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}

export function subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void {
  listeners.add(callback);
  // Emula o disparo inicial assíncrono do onAuthStateChanged real.
  Promise.resolve().then(() => callback(currentAccount ? toAuthUser(currentAccount) : null));
  return () => {
    listeners.delete(callback);
  };
}
