import { useAuthContext } from '@/contexts/auth-context';

export function useProfile() {
  const { user } = useAuthContext();

  return {
    name: user?.displayName ?? '',
    email: user?.email ?? '',
    photoUrl: user?.photoURL ?? undefined,
  };
}
