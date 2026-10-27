import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';
import {
  CATEGORY_OPTIONS,
  TRANSACTIONS_QUERY_KEYS,
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
  deleteTransactionReceipt,
  getTransactions,
  isDepositType,
  preloadTransactionReceipts,
  updateTransaction as updateTransactionService,
  uploadTransactionReceipt,
  type Transaction,
  type TransactionFormValues,
  type TransactionReceipt,
} from '@/modules/transactions';

export type CategoryBreakdownItem = {
  categoryId: number;
  label: string;
  total: number;
};

export type TransactionsContextValue = {
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;

  // Métricas calculadas globalmente
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  biggestExpense: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];

  // Ações CRUD
  createTransaction: (input: TransactionFormValues) => Promise<string>;
  updateTransaction: (
    id: string,
    input: TransactionFormValues,
    previousReceipt?: TransactionReceipt
  ) => Promise<void>;
  deleteTransaction: (id: string, receiptPath?: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  const transactionsQuery = useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.list(user?.uid),
    queryFn: () => (user ? getTransactions(user.uid) : Promise.resolve([])),
    enabled: Boolean(user),
    staleTime: 30_000,
  });

  const transactions = useMemo(
    () => transactionsQuery.data ?? [],
    [transactionsQuery.data]
  );
  const isLoading = transactionsQuery.isLoading;
  const isRefreshing = transactionsQuery.isFetching && !transactionsQuery.isLoading;
  const error = transactionsQuery.error ? String(transactionsQuery.error) : null;

  useEffect(() => {
    if (transactionsQuery.data) {
      void preloadTransactionReceipts(transactionsQuery.data.slice(0, 10));
    }
  }, [transactionsQuery.data]);

  const invalidateTransactionQueries = useCallback(async () => {
    if (!user) return;

    await queryClient.invalidateQueries({
      queryKey: TRANSACTIONS_QUERY_KEYS.list(user.uid),
      exact: true,
    });
  }, [queryClient, user]);

  const createTransaction = useCallback(
    async (input: TransactionFormValues): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');

      const id = await createTransactionService(user.uid, input);

      if (input.receiptFile) {
        const receipt = await uploadTransactionReceipt(user.uid, id, input.receiptFile);
        await updateTransactionService(user.uid, id, input, receipt, false);
      }

      await invalidateTransactionQueries();
      return id;
    },
    [invalidateTransactionQueries, user]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      input: TransactionFormValues,
      previousReceipt?: TransactionReceipt
    ): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');

      const receipt = input.receiptFile
        ? await uploadTransactionReceipt(user.uid, id, input.receiptFile)
        : input.receipt;

      await updateTransactionService(user.uid, id, input, receipt, Boolean(previousReceipt));

      if (previousReceipt && previousReceipt.path !== receipt?.path) {
        await deleteTransactionReceipt(previousReceipt.path);
      }

      await invalidateTransactionQueries();
    },
    [invalidateTransactionQueries, user]
  );

  const deleteTransaction = useCallback(
    async (id: string, receiptPath?: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');

      await deleteTransactionService(user.uid, id, receiptPath);
      await invalidateTransactionQueries();
    },
    [invalidateTransactionQueries, user]
  );

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    await queryClient.refetchQueries({
      queryKey: TRANSACTIONS_QUERY_KEYS.list(user.uid),
      exact: true,
    });
  }, [queryClient, user]);

  // Cálculos globais de totais e resumo
  const metrics = useMemo(() => {
    const deposits = transactions.filter((t) => isDepositType(t.type));
    const expenses = transactions.filter((t) => !isDepositType(t.type));

    const totalIncome = deposits.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    const balance = totalIncome - totalExpenses;

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

    const categoryBreakdown: CategoryBreakdownItem[] = Array.from(categoryMap.entries()).map(
      ([id, total]) => ({
        categoryId: id,
        label: CATEGORY_OPTIONS.find((c) => c.value === id)?.label ?? 'Outros',
        total,
      })
    );

    return {
      balance,
      totalIncome,
      totalExpenses,
      biggestExpense,
      transactionCount: transactions.length,
      recentTransactions,
      categoryBreakdown,
    };
  }, [transactions]);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      isLoading,
      isRefreshing,
      error,
      ...metrics,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      refreshTransactions,
    }),
    [transactions, isLoading, isRefreshing, error, metrics, createTransaction, updateTransaction, deleteTransaction, refreshTransactions]
  );

  return (
    <TransactionsContext.Provider value={value}>
      {children}
    </TransactionsContext.Provider>
  );
}

export function useTransactionsContext(): TransactionsContextValue {
  const context = useContext(TransactionsContext);
  if (!context) {
    throw new Error('useTransactionsContext deve ser usado dentro de <TransactionsProvider>.');
  }
  return context;
}
