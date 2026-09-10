import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';

export function useDeleteTransaction() {
  const { deleteTransaction } = useTransactionsContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (id: string): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      await deleteTransaction(id);
    } catch (err) {
      const e = err instanceof Error ? err : new Error('Não foi possível excluir a transação.');
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

