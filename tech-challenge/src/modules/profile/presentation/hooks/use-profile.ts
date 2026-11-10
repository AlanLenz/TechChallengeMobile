import { useAuthContext } from '@/contexts/auth-context';

export function useProfile() {
  const {
    user,
    isEmailVerified,
    sendVerificationEmail,
    isBiometricSupported,
    biometricLabel,
    isBiometricEnabled,
    toggleBiometricLock,
  } = useAuthContext();

  return {
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    photoUrl: user?.photoURL ?? undefined,
    isEmailVerified,
    sendVerificationEmail,
    isBiometricSupported,
    biometricLabel,
    isBiometricEnabled,
    toggleBiometricLock,
  };
}
