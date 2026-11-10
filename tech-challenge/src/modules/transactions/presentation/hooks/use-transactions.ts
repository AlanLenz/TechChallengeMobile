import { useTransactionsContext } from '../../context';

export function useTransactions() {
  const { transactions, isLoading, isRefreshing, error, refreshTransactions } =
    useTransactionsContext();

  return {
    data: transactions,
    isLoading,
    isRefreshing,
    isError: Boolean(error),
    error,
    refetch: refreshTransactions,
  };
}
