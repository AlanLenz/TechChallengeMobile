import { useMutation } from '@tanstack/react-query';

import { authRepository } from '../../container';
import type { LoginInput } from '../../domain/entities/auth.entity';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => authRepository.login(email, password),
  });
}


