import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';
import { CATEGORY_OPTIONS } from '@/modules/transactions';

import { HOME_QUERY_KEYS } from '../constants';
import { getTransactions } from '../services/home.service';
import type { DashboardStats } from '../types';

export function useHomeDashboard() {
  const { user } = useAuthContext();

  return useQuery<DashboardStats>({
    queryKey: HOME_QUERY_KEYS.list(user?.uid),
    enabled: Boolean(user),
    queryFn: async () => {
      try {
        const transactions = await getTransactions(user!.uid);
        const deposits = transactions.filter((t) => t.type === 'Deposit');
        const expenses = transactions.filter((t) => t.type !== 'Deposit');

        const totalIncome = deposits.reduce((s, t) => s + t.amount, 0);
        const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

        // Compute balance from transaction history rather than the stored
        // accounts.balance field, which is not updated on each transaction.
        const totalBalance = totalIncome - totalExpenses;
        const biggestExpense = expenses.length
          ? Math.max(...expenses.map((t) => t.amount))
          : 0;

        const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date));
        const recentTransactions = sorted.slice(0, 5);

        const categoryMap = new Map<number, number>();
        for (const t of expenses) {
          if (t.categories_id === undefined) continue;
          const prev = categoryMap.get(t.categories_id) ?? 0;
          categoryMap.set(t.categories_id, prev + t.amount);
        }
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([id, total]) => ({
          categoryId: id,
          label: CATEGORY_OPTIONS.find((c) => c.value === id)?.label ?? 'Outros',
          total,
        }));

        return {
          totalBalance,
          totalIncome,
          totalExpenses,
          biggestExpense,
          transactionCount: transactions.length,
          recentTransactions,
          categoryBreakdown,
        };
      } catch (err) {
        console.error('[useHomeDashboard] queryFn failed:', err);
        throw err;
      }
    },
  });
}
