import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { updateAvatar } from '../../infrastructure/firebase/firebase-profile-repository';

export function useUpdateAvatar() {
  const { user, refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: (blob: Blob) => updateAvatar(user!.uid, blob),
    onSuccess: refreshUser,
  });
}

