import { useMutation } from '@tanstack/react-query';

import { login } from '../../infrastructure/firebase/firebase-auth.repository';
import type { LoginInput } from '../../domain/entities/auth.entity';

export function useLogin() {
  return useMutation({
    mutationFn: ({ email, password }: LoginInput) => login(email, password),
  });
}


