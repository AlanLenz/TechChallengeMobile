import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import { deleteTransaction } from '../services/transactions.service';

type DeleteTransactionArgs = {
  id: string;
  /** Caminho do comprovante no Storage, se houver — apagado junto com a transação. */
  receiptPath?: string;
};

export function useDeleteTransaction() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, receiptPath }: DeleteTransactionArgs) =>
      deleteTransaction(user!.uid, id, receiptPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}
