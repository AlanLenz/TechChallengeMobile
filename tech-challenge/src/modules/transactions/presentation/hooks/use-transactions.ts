import { useTransactionsContext } from '../context/transactions-context';

export function useTransactions() {
  const { transactions, isLoading, error, refreshTransactions } =
    useTransactionsContext();

  return {
    data: transactions,
    isLoading,
    isError: Boolean(error),
    error,
    refetch: refreshTransactions,
  };
}

