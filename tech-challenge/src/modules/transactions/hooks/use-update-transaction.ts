import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import { updateTransaction } from '../services/transactions.service';
import type { TransactionFormValues } from '../validations';

export function useUpdateTransaction() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: TransactionFormValues }) =>
      updateTransaction(user!.uid, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}
