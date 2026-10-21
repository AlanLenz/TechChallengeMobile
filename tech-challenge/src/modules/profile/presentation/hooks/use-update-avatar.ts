import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { profileUseCases } from '../../container';

export function useUpdateAvatar() {
  const { user, refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: (blob: Blob) => profileUseCases.updateAvatar.execute(user!.uid, blob),
    onSuccess: refreshUser,
  });
}
