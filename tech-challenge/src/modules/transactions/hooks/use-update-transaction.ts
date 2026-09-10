import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';
import type { TransactionFormValues } from '../validations';

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

  return {
    mutateAsync,
    isPending,
    isError: Boolean(error),
    error,
  };
}

