import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import {
  deleteTransactionReceipt,
  updateTransaction,
  uploadTransactionReceipt,
} from '../services/transactions.service';
import type { TransactionReceipt } from '../types';
import type { TransactionFormValues } from '../validations';

type UpdateTransactionArgs = {
  id: string;
  input: TransactionFormValues;
  /** Comprovante que a transação já tinha antes desta edição (para trocar/remover o arquivo). */
  previousReceipt?: TransactionReceipt;
};

export function useUpdateTransaction() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, input, previousReceipt }: UpdateTransactionArgs) => {
      const userId = user!.uid;

      const receipt = input.receiptFile
        ? await uploadTransactionReceipt(userId, id, input.receiptFile)
        : input.receipt;

      await updateTransaction(userId, id, input, receipt, Boolean(previousReceipt));

      // Trocou ou removeu o comprovante: apaga o arquivo antigo do Storage (best-effort).
      if (previousReceipt && previousReceipt.path !== receipt?.path) {
        await deleteTransactionReceipt(previousReceipt.path);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}
