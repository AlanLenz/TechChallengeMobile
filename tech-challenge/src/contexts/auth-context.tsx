import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, type AppStateStatus } from 'react-native';

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
import {
  authenticateWithBiometrics,
  getBiometricSupport,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
} from '@/services/biometric.service';
import type { AuthStatus } from '@/types/navigation';

/** Tempo mínimo em segundo plano (5 segundos) antes de exigir biometria ao retomar o app. */
const BACKGROUND_LOCK_TIMEOUT_MS = 5_000;

type AuthContextValue = {
  user: User | null;
  status: AuthStatus;
  isEmailVerified: boolean;
  isBiometricSupported: boolean;
  biometricLabel: string;
  isBiometricEnabled: boolean;
  isBiometricLocked: boolean;
  unlockWithBiometrics: () => Promise<boolean>;
  toggleBiometricLock: (enabled: boolean) => Promise<boolean>;
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

  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState('Biometria');
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [isBiometricLocked, setIsBiometricLocked] = useState(false);

  // Marca se o login/cadastro acabou de ser realizado manualmente com senha nesta sessão,
  // evitando pedir biometria imediatamente após digitar a senha.
  const justAuthenticatedWithCredentialsRef = useRef(false);
  const isPromptingBiometricsRef = useRef(false);
  const backgroundTimestampRef = useRef<number | null>(null);

  const unlockWithBiometrics = useCallback(async (): Promise<boolean> => {
    if (isPromptingBiometricsRef.current) return false;
    isPromptingBiometricsRef.current = true;

    try {
      const success = await authenticateWithBiometrics(
        'Desbloqueie para acessar seus dados financeiros'
      );
      if (success) {
        setIsBiometricLocked(false);
      }
      return success;
    } finally {
      isPromptingBiometricsRef.current = false;
    }
  }, []);

  const toggleBiometricLock = useCallback(
    async (enabled: boolean): Promise<boolean> => {
      if (enabled) {
        const verified = await authenticateWithBiometrics(
          'Confirme sua biometria para ativar o bloqueio automático'
        );
        if (!verified) return false;
      }

      await setBiometricLockEnabled(enabled);
      setIsBiometricEnabled(enabled);
      if (!enabled) {
        setIsBiometricLocked(false);
      }
      return true;
    },
    []
  );

  // Carrega capacidade biométrica do dispositivo e preferência salva
  useEffect(() => {
    let mounted = true;

    async function loadBiometricConfig() {
      const [support, enabled] = await Promise.all([
        getBiometricSupport(),
        isBiometricLockEnabled(),
      ]);

      if (!mounted) return;
      setIsBiometricSupported(support.isAvailable);
      setBiometricLabel(support.label);
      setIsBiometricEnabled(support.isAvailable && enabled);
    }

    void loadBiometricConfig();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isEnvValid) return;

    const unsubscribe = subscribeToAuthChanges(async (nextUser) => {
      const previousUserId = activeUserId.current;
      const nextUserId = nextUser?.uid ?? null;

      if (previousUserId && previousUserId !== nextUserId) {
        if (!nextUserId) {
          queryClient.clear();
        } else {
          queryClient.removeQueries({
            predicate: ({ queryKey }) => queryKey.includes(previousUserId),
          });
        }
      }

      activeUserId.current = nextUserId;
      setUser(nextUser);

      if (nextUser) {
        const [support, enabled] = await Promise.all([
          getBiometricSupport(),
          isBiometricLockEnabled(),
        ]);

        setIsBiometricSupported(support.isAvailable);
        setBiometricLabel(support.label);
        const shouldLock = support.isAvailable && enabled;
        setIsBiometricEnabled(shouldLock);

        // Se a sessão foi restaurada automaticamente ao abrir o app (não veio de signIn/signUp manual),
        // bloqueia o acesso até a confirmação biométrica.
        if (shouldLock && !justAuthenticatedWithCredentialsRef.current) {
          setIsBiometricLocked(true);
        } else {
          justAuthenticatedWithCredentialsRef.current = false;
          setIsBiometricLocked(false);
        }
      } else {
        justAuthenticatedWithCredentialsRef.current = false;
        setIsBiometricLocked(false);
      }

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

  // Monitora transições de segundo plano -> primeiro plano para exigir biometria ao retomar o app
  useEffect(() => {
    if (status !== 'authenticated' || !isBiometricSupported || !isBiometricEnabled) {
      return;
    }

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundTimestampRef.current = Date.now();
      } else if (nextState === 'active' && backgroundTimestampRef.current !== null) {
        const elapsed = Date.now() - backgroundTimestampRef.current;
        backgroundTimestampRef.current = null;

        if (elapsed >= BACKGROUND_LOCK_TIMEOUT_MS && !isPromptingBiometricsRef.current) {
          setIsBiometricLocked(true);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [status, isBiometricSupported, isBiometricEnabled]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isEmailVerified: Boolean(user?.emailVerified),
      isBiometricSupported,
      biometricLabel,
      isBiometricEnabled,
      isBiometricLocked,
      unlockWithBiometrics,
      toggleBiometricLock,
      signIn: async (email, password) => {
        justAuthenticatedWithCredentialsRef.current = true;
        await firebaseSignIn(email, password);
      },
      signUp: async (name, email, password) => {
        justAuthenticatedWithCredentialsRef.current = true;
        await firebaseSignUp(name, email, password);
      },
      signOut: async () => {
        setIsBiometricLocked(false);
        await firebaseSignOut();
      },
      resetPassword: async (email) => {
        await firebaseResetPassword(email);
      },
      sendVerificationEmail: firebaseSendVerificationEmail,
      refreshUser: async () => {
        const refreshed = await reloadCurrentUser();
        setUser(refreshed);
      },
    }),
    [
      user,
      status,
      isBiometricSupported,
      biometricLabel,
      isBiometricEnabled,
      isBiometricLocked,
      unlockWithBiometrics,
      toggleBiometricLock,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>.');
  return context;
}
