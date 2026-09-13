import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';
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

  return {
    mutateAsync,
    isPending,
    isError: Boolean(error),
    error,
  };
}


