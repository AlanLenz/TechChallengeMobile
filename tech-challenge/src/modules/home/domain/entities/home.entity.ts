import type { CategoryBreakdownItem, Transaction } from '@/modules/transactions';

export type AccountSummary = {
  id: string;
  ownerId: string;
  label: string;
  balance: number;
};

export type DashboardStats = {
  totalBalance: number;
  totalIncome: number;      // sum of deposits
  totalExpenses: number;    // sum of transfers
  biggestExpense: number;   // max single expense
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
};
