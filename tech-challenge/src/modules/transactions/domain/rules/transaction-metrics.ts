import { CATEGORIES_MAP, isDepositType, type CategoryId, type Transaction } from '../entities/transaction.entity';

export type CategoryBreakdownItem = {
  categoryId: number;
  label: string;
  total: number;
};

export type TransactionMetrics = {
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  biggestExpense: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
};

const RECENT_TRANSACTIONS_LIMIT = 5;

/** Totais e resumo do conjunto de transações do usuário — regra de negócio pura. */
export function computeTransactionMetrics(transactions: Transaction[]): TransactionMetrics {
  const deposits = transactions.filter((t) => isDepositType(t.type));
  const expenses = transactions.filter((t) => !isDepositType(t.type));

  const totalIncome = deposits.reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);

  const biggestExpense = expenses.length ? Math.max(...expenses.map((t) => t.amount)) : 0;

  const recentTransactions = [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, RECENT_TRANSACTIONS_LIMIT);

  const categoryMap = new Map<number, number>();
  for (const t of expenses) {
    if (t.categories_id === undefined) continue;
    categoryMap.set(t.categories_id, (categoryMap.get(t.categories_id) ?? 0) + t.amount);
  }

  const categoryBreakdown: CategoryBreakdownItem[] = Array.from(categoryMap.entries()).map(
    ([id, total]) => ({
      categoryId: id,
      label: CATEGORIES_MAP[id as CategoryId] ?? 'Outros',
      total,
    })
  );

  return {
    balance: totalIncome - totalExpenses,
    totalIncome,
    totalExpenses,
    biggestExpense,
    transactionCount: transactions.length,
    recentTransactions,
    categoryBreakdown,
  };
}
