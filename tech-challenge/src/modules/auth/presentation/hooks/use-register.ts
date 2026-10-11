import { useMutation } from '@tanstack/react-query';

import { register } from '../../infrastructure/firebase/firebase-auth.repository';
import type { RegisterInput } from '../../domain/entities/auth.entity';

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) => register(name, email, password),
  });
}


