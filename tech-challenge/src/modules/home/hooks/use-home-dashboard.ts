import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';
import { CATEGORIES } from '@/modules/transfers/constants';

import { HOME_QUERY_KEYS } from '../constants';
import { getTransfers } from '../services/home.service';
import type { DashboardStats } from '../types';

export function useHomeDashboard() {
  const { user } = useAuthContext();

  return useQuery<DashboardStats>({
    queryKey: ['dashboard', user?.uid],
    enabled: Boolean(user),
    queryFn: async () => {
      try {
        const transfers = await getTransfers(user!.uid);
        const deposits = transfers.filter((t) => t.type === 'deposit');
        const expenses = transfers.filter((t) => t.type !== 'deposit');

        const totalIncome = deposits.reduce((s, t) => s + t.amount, 0);
        const totalExpenses = expenses.reduce((s, t) => s + t.amount, 0);

        // Compute balance from transaction history rather than the stored
        // accounts.balance field, which is not updated on each transfer.
        const totalBalance = totalIncome - totalExpenses;
        const biggestExpense = expenses.length
          ? Math.max(...expenses.map((t) => t.amount))
          : 0;

        const sorted = [...transfers].sort((a, b) => b.date.localeCompare(a.date));
        const recentTransfers = sorted.slice(0, 5);

        const categoryMap = new Map<number, number>();
        for (const t of expenses) {
          const prev = categoryMap.get(t.categories_id) ?? 0;
          categoryMap.set(t.categories_id, prev + t.amount);
        }
        const categoryBreakdown = Array.from(categoryMap.entries()).map(([id, total]) => ({
          categoryId: id,
          label: CATEGORIES.find((c) => c.value === id)?.label ?? 'Outros',
          total,
        }));

        return {
          totalBalance,
          totalIncome,
          totalExpenses,
          biggestExpense,
          transactionCount: transfers.length,
          recentTransfers,
          categoryBreakdown,
        };
      } catch (err) {
        console.error('[useHomeDashboard] queryFn failed:', err);
        throw err;
      }
    },
  });
}
