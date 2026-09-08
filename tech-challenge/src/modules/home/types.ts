import type { WithId } from '@/types/api';
import type { Transaction } from '@/modules/transactions';

export type AccountSummary = WithId<{
  ownerId: string;
  label: string;
  balance: number;
}>;

export type DashboardStats = {
  totalBalance: number;
  totalIncome: number;      // sum of deposits
  totalExpenses: number;    // sum of transfers
  biggestExpense: number;   // max single expense
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: { categoryId: number; label: string; total: number }[];
};

