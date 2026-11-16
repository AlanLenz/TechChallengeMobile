import {
  calculateTransactionMetrics,
  useTransactionsContext,
} from '@/modules/transactions';
import type { DashboardStats } from '../../domain/entities/home.entity';
import {
  filterTransactionsByPeriod,
  type DashboardPeriod,
} from '../../domain/services/dashboard-period.service';

export function useHomeDashboard(period: DashboardPeriod = 'this-month') {
  const {
    transactions,
    balance: totalBalance,
    recentTransactions,
    isLoading,
    error,
    refreshTransactions,
  } = useTransactionsContext();

  const periodMetrics = calculateTransactionMetrics(
    filterTransactionsByPeriod(transactions, period)
  );

  const data: DashboardStats = {
    totalBalance,
    totalIncome: periodMetrics.totalIncome,
    totalExpenses: periodMetrics.totalExpenses,
    biggestExpense: periodMetrics.biggestExpense,
    transactionCount: periodMetrics.transactionCount,
    recentTransactions,
    categoryBreakdown: periodMetrics.categoryBreakdown,
  };

  return {
    data,
    isPending: isLoading,
    isError: Boolean(error),
    error,
    refetch: refreshTransactions,
  };
}


