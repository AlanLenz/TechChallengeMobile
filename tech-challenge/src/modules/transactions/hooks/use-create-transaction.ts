import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';
import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import {
  createTransaction,
  updateTransaction,
  uploadTransactionReceipt,
} from '../services/transactions.service';
import type { TransactionFormValues } from '../validations';

export function useCreateTransaction() {
  const { createTransaction } = useTransactionsContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (input: TransactionFormValues): Promise<string> => {
    setIsPending(true);
    setError(null);
    try {
      return await createTransaction(input);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Não foi possível salvar a transação.');
      setError(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return useMutation({
    mutationFn: async (input: TransactionFormValues) => {
      const userId = user!.uid;
      // A transação é criada primeiro para termos o id real no caminho do Storage — assim o
      // upload nunca gera arquivo órfão. Se o upload falhar, a transação persiste sem
      // comprovante e o usuário reanexa pela tela de edição.
      const id = await createTransaction(userId, input);

      if (input.receiptFile) {
        const receipt = await uploadTransactionReceipt(userId, id, input.receiptFile);
        await updateTransaction(userId, id, input, receipt, false);
      }

      return id;
    },
    // `onSettled` (não `onSuccess`): mesmo se o upload do comprovante falhar, a transação já
    // foi criada e precisa aparecer na listagem.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}

