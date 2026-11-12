import { useMutation } from '@tanstack/react-query';

import { authRepository } from '../../container';
import type { RegisterInput } from '../../domain/entities/auth.entity';

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) => authRepository.register(name, email, password),
  });
}


