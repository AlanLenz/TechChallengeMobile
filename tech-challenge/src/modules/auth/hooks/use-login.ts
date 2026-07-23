import { useMutation } from '@tanstack/react-query';

import { login } from '../services/auth.service';
import type { LoginInput } from '../types';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => login(email, password),
  });
}
