import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';
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
  const { updateTransaction } = useTransactionsContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async ({
    id,
    input,
  }: {
    id: string;
    input: TransactionFormValues;
  }): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      await updateTransaction(id, input);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Não foi possível salvar a transação.');
      setError(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

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

