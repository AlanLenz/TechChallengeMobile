import { useMutation } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { authRepository } from '../../container';
import type { RegisterInput } from '../../domain/entities/auth.entity';

export function useRegister() {
  const { refreshUser } = useAuthContext();

  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) => authRepository.register(name, email, password),
    onSuccess: () => refreshUser(),
  });
}


