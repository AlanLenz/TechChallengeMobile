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
  computeTransactionMetrics,
  preloadTransactionReceipts,
  transactionUseCases,
  type CategoryBreakdownItem,
  type Transaction,
  type TransactionInput,
  type TransactionReceipt,
} from '@/modules/transactions';

export type { CategoryBreakdownItem };

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
  createTransaction: (input: TransactionInput) => Promise<string>;
  updateTransaction: (
    id: string,
    input: TransactionInput,
    previousReceipt?: TransactionReceipt
  ) => Promise<void>;
  deleteTransaction: (id: string, receiptPath?: string) => Promise<void>;
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
      const data = await transactionUseCases.getTransactions.execute(user.uid);
      setTransactions(data);
      setError(null);

      // Pré-carrega comprovantes das transações recentes para cache nativo
      void preloadTransactionReceipts(data.slice(0, 10));
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
        const data = await transactionUseCases.getTransactions.execute(user.uid);
        if (isMounted) {
          setTransactions(data);
          setError(null);

          // Pré-carrega comprovantes das transações recentes para cache nativo
          void preloadTransactionReceipts(data.slice(0, 10));
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
    async (input: TransactionInput): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');
      const id = await transactionUseCases.createTransaction.execute(user.uid, input);
      await reload();
      return id;
    },
    [user, reload]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      input: TransactionInput,
      previousReceipt?: TransactionReceipt
    ): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');
      await transactionUseCases.updateTransaction.execute(user.uid, id, input, previousReceipt);
      await reload();
    },
    [user, reload]
  );

  const deleteTransaction = useCallback(
    async (id: string, receiptPath?: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');
      await transactionUseCases.deleteTransaction.execute(user.uid, id, receiptPath);
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

  // Cálculos globais de totais e resumo (regra de negócio no domínio)
  const metrics = useMemo(() => computeTransactionMetrics(transactions), [transactions]);

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
