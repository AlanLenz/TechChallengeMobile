import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isEnvValid } from '@/config/env';
import {
  reloadCurrentUser,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  subscribeToAuthChanges,
  type User,
} from '@/firebase/auth';
import type { AuthStatus } from '@/types/navigation';

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Sem credenciais reais ainda (.env não preenchido): não há sessão para restaurar — parte
  // direto como não autenticado em vez de deixar o app travado em "loading" para sempre.
  const [status, setStatus] = useState<AuthStatus>(isEnvValid ? 'loading' : 'unauthenticated');

  useEffect(() => {
    if (!isEnvValid) return;

    const unsubscribe = subscribeToAuthChanges((nextUser) => {
      setUser(nextUser);
      setStatus(nextUser ? 'authenticated' : 'unauthenticated');
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      signIn: async (email, password) => {
        await firebaseSignIn(email, password);
      },
      signOut: firebaseSignOut,
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
