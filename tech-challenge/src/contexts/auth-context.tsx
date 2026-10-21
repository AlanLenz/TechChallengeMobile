import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { isEnvValid } from '@/config/env';
import { authUseCases, type AuthUser } from '@/modules/auth';
import type { AuthStatus } from '@/types/navigation';

type AuthContextValue = {
  user: AuthUser | null;
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
  const [user, setUser] = useState<AuthUser | null>(null);
  // Sem credenciais reais ainda (.env não preenchido): não há sessão para restaurar — parte
  // direto como não autenticado em vez de deixar o app travado em "loading" para sempre.
  const [status, setStatus] = useState<AuthStatus>(isEnvValid ? 'loading' : 'unauthenticated');

  useEffect(() => {
    if (!isEnvValid) return;

    const unsubscribe = authUseCases.observeAuthState.execute((nextUser) => {
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
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isEmailVerified: Boolean(user?.emailVerified),
      signIn: (email, password) => authUseCases.login.execute({ email, password }),
      signUp: (name, email, password) => authUseCases.register.execute({ name, email, password }),
      signOut: () => authUseCases.signOut.execute(),
      resetPassword: (email) => authUseCases.requestPasswordReset.execute({ email }),
      sendVerificationEmail: () => authUseCases.sendVerificationEmail.execute(),
      refreshUser: async () => {
        const refreshed = await authUseCases.refreshUser.execute();
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
