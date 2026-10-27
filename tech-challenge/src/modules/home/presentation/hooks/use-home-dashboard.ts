import { useTransactionsContext } from '@/modules/transactions';
import type { DashboardStats } from '../../domain/entities/home.entity';

export function useHomeDashboard() {
  const {
    balance: totalBalance,
    totalIncome,
    totalExpenses,
    biggestExpense,
    transactionCount,
    recentTransactions,
    categoryBreakdown,
    isLoading,
    error,
    refreshTransactions,
  } = useTransactionsContext();

  const data: DashboardStats = {
    totalBalance,
    totalIncome,
    totalExpenses,
    biggestExpense,
    transactionCount,
    recentTransactions,
    categoryBreakdown,
  };

  return {
    data,
    isPending: isLoading,
    isError: Boolean(error),
    error,
    refetch: refreshTransactions,
  };
}


