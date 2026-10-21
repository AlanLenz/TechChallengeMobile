import { useMutation } from '@tanstack/react-query';

import { authUseCases } from '../../container';
import type { RegisterInput } from '../../domain/entities/auth.entity';

export function useRegister() {
  return useMutation({
    mutationFn: (input: RegisterInput) => authUseCases.register.execute(input),
  });
}
