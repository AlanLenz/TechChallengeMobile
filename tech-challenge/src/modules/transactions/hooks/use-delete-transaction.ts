import { useState } from 'react';

import { useTransactionsContext } from '@/contexts/transactions-context';

type DeleteTransactionArgs = {
  id: string;
  /** Caminho do comprovante no Storage, se houver — apagado junto com a transação. */
  receiptPath?: string;
};

export function useDeleteTransaction() {
  const { deleteTransaction } = useTransactionsContext();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutateAsync = async (args: string | DeleteTransactionArgs): Promise<void> => {
    setIsPending(true);
    setError(null);
    try {
      const id = typeof args === 'string' ? args : args.id;
      const receiptPath = typeof args === 'string' ? undefined : args.receiptPath;
      await deleteTransaction(id, receiptPath);
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


