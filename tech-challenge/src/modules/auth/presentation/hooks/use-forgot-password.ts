import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '../../infrastructure/firebase/firebase-auth.repository';
import type { ForgotPasswordInput } from '../../domain/entities/auth.entity';

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => requestPasswordReset(email),
  });
}


