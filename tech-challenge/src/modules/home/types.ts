import type { WithId } from '@/types/api';
import type { Transfer } from '@/modules/transfers';

export type AccountSummary = WithId<{
  ownerId: string;
  label: string;
  balance: number;
}>;

export type DashboardStats = {
  totalBalance: number;
  totalIncome: number;      // sum of deposits
  totalExpenses: number;    // sum of transfers + withdrawals
  biggestExpense: number;   // max single expense
  transactionCount: number;
  recentTransfers: Transfer[];
  categoryBreakdown: { categoryId: number; label: string; total: number }[];
};

