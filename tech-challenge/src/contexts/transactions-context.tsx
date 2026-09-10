import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/auth-context';
import {
  CATEGORY_OPTIONS,
  createTransaction as createTransactionService,
  deleteTransaction as deleteTransactionService,
  getTransactions,
  isDepositType,
  updateTransaction as updateTransactionService,
  type Transaction,
  type TransactionFormValues,
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
  updateTransaction: (id: string, input: TransactionFormValues) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
};

const TransactionsContext = createContext<TransactionsContextValue | undefined>(undefined);

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!user) {
      setTransactions([]);
      return;
    }
    try {
      const data = await getTransactions(user.uid);
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('[TransactionsContext] Erro ao buscar transações:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar transações.');
    }
  }, [user]);

  useEffect(() => {
    let isMounted = true;

    Promise.resolve().then(async () => {
      if (!isMounted) return;

      if (!user) {
        setTransactions([]);
        setIsLoading(false);
        return;
      }

      try {
        const data = await getTransactions(user.uid);
        if (isMounted) {
          setTransactions(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao carregar transações.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
    };
  }, [user]);


  const createTransaction = useCallback(
    async (input: TransactionFormValues): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');
      const id = await createTransactionService(user.uid, input);
      await reload();
      return id;
    },
    [user, reload]
  );

  const updateTransaction = useCallback(
    async (id: string, input: TransactionFormValues): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');
      await updateTransactionService(user.uid, id, input);
      await reload();
    },
    [user, reload]
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');
      await deleteTransactionService(user.uid, id);
      await reload();
    },
    [user, reload]
  );

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    setIsRefreshing(true);
    try {
      await reload();
    } finally {
      setIsRefreshing(false);
    }
  }, [user, reload]);


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
    [
      transactions,
      isLoading,
      isRefreshing,
      error,
      metrics,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      refreshTransactions,
    ]
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
