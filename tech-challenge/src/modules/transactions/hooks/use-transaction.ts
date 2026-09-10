import { useTransactionsContext } from '@/contexts/transactions-context';

/** Busca uma transação por id diretamente do estado global do TransactionsContext. */
export function useTransaction(id?: string) {
  const { transactions, isLoading } = useTransactionsContext();
  const transaction = transactions.find((t) => t.id === id);

  return {
    data: transaction,
    isLoading: isLoading && !transaction,
  };
}

