import { useMutation } from '@tanstack/react-query';

import { authRepository } from '../../container';
import type { ForgotPasswordInput } from '../../domain/entities/auth.entity';

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => authRepository.requestPasswordReset(email),
  });
}


