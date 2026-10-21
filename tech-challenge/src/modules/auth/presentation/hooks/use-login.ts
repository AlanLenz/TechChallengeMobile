import { useMutation } from '@tanstack/react-query';

import { authUseCases } from '../../container';
import type { LoginInput } from '../../domain/entities/auth.entity';

export function useLogin() {
  return useMutation({
    mutationFn: (input: LoginInput) => authUseCases.login.execute(input),
  });
}
