import { useMutation } from '@tanstack/react-query';

import { register } from '../services/auth.service';
import type { RegisterInput } from '../types';

export function useRegister() {
  return useMutation({
    mutationFn: ({ name, email, password }: RegisterInput) => register(name, email, password),
  });
}
