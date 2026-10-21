import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';
import type { TransactionReceipt } from '../../domain/entities/transaction.entity';
import { toTransactionInput, type TransactionFormValues } from '../validation/transaction.validation';

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
    previousReceipt,
  }: UpdateTransactionArgs): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      await updateTransaction(id, toTransactionInput(input), previousReceipt);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Não foi possível salvar a transação.');
      setError(e);
      throw e;
    } finally {
      setIsPending(false);
    }
  };

  return {
    mutateAsync,
    isPending,
    isError: Boolean(error),
    error,
  };
}



