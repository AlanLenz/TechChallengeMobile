import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { profileRepository } from '../../container';

export function useUpdateAvatar() {
  const { user, refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: (blob: Blob) => profileRepository.updateAvatar(user!.uid, blob),
    onSuccess: refreshUser,
  });
}

