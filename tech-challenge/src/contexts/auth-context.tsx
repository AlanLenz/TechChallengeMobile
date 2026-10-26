import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { useQueryClient } from '@tanstack/react-query';
import { isEnvValid } from '@/config/env';
import {
  reloadCurrentUser,
  resetPassword as firebaseResetPassword,
  sendVerificationEmail as firebaseSendVerificationEmail,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  signUp as firebaseSignUp,
  subscribeToAuthChanges,
  type User,
} from '@/firebase/auth';
import type { AuthStatus } from '@/types/navigation';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isEmailVerified: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<User | null>(null);
  const activeUserId = useRef<string | null>(null);
  // Sem credenciais reais ainda (.env não preenchido): não há sessão para restaurar — parte
  // direto como não autenticado em vez de deixar o app travado em "loading" para sempre.
  const [status, setStatus] = useState<AuthStatus>(isEnvValid ? 'loading' : 'unauthenticated');

  useEffect(() => {
    if (!isEnvValid) return;

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      const previousUserId = activeUserId.current;
      const nextUserId = nextUser?.uid ?? null;

      if (previousUserId && previousUserId !== nextUserId) {
        queryClient.removeQueries({
          predicate: ({ queryKey }) => queryKey.includes(previousUserId),
        });
      }

      activeUserId.current = nextUserId;
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');

      // Preload user avatar image if it exists
      if (nextUser?.photoURL) {
        import('expo-image').then(({ Image }) => {
          Image.prefetch(nextUser.photoURL!);
        });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isEmailVerified: Boolean(user?.emailVerified),
      signIn: async (email, password) => {
        await firebaseSignIn(email, password);
      },
      signUp: async (name, email, password) => {
        await firebaseSignUp(name, email, password);
      },
      signOut: firebaseSignOut,
      resetPassword: async (email) => {
        await firebaseResetPassword(email);
      },
      sendVerificationEmail: firebaseSendVerificationEmail,
      refreshUser: async () => {
        const refreshed = await reloadCurrentUser();
        setUser(refreshed);
      },
    }),
    [user, status]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>.');
  return context;
}
