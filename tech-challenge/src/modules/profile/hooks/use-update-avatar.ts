import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { updateAvatar } from '../services/profile.service';

export function useUpdateAvatar() {
  const { user, refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: (blob: Blob) => updateAvatar(user!.uid, blob),
    onSuccess: refreshUser,
  });
}
