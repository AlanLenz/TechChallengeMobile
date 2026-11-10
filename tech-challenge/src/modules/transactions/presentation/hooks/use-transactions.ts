import { useTransactionsContext } from '../../context';

export function useTransactions() {
  const { transactions, isLoading, isRefreshing, error, refreshTransactions } =
    useTransactionsContext();

  return {
    data: transactions,
    isLoading,
    isError: Boolean(error),
    error,
    refetch: refreshTransactions,
    isRefreshing,
  };
}
