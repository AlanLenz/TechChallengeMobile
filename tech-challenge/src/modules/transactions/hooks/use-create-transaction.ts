import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import { createTransaction } from '../services/transactions.service';
import type { TransactionFormValues } from '../validations';

export function useCreateTransaction() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransactionFormValues) => createTransaction(user!.uid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}
