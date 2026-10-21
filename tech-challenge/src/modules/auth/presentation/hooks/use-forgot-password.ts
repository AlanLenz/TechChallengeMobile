import { useMutation } from '@tanstack/react-query';

import { authUseCases } from '../../container';
import type { ForgotPasswordInput } from '../../domain/entities/auth.entity';

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authUseCases.requestPasswordReset.execute(input),
  });
}
