import { useMutation } from '@tanstack/react-query';

import { requestPasswordReset } from '../services/auth.service';
import type { ForgotPasswordInput } from '../types';

export function useForgotPassword() {
  return useMutation({
    mutationFn: ({ email }: ForgotPasswordInput) => requestPasswordReset(email),
  });
}
