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
  createTransactionWithReceipt,
  updateTransactionWithReceipt,
} from './application/transaction.use-cases';
import { TRANSACTIONS_QUERY_KEYS } from './constants';
import { transactionRepository } from './container';
import type { Transaction, TransactionReceipt } from './domain/entities/transaction.entity';
import type { TransactionFormValues } from './domain/entities/transaction.validation';
import {
  calculateTransactionMetrics,
  type CategoryBreakdownItem,
} from './domain/services/transaction-metrics.service';
import { preloadTransactionReceipts } from './preload';
import { useTransactionsStream } from './presentation/hooks/use-transactions-stream';

export type { CategoryBreakdownItem };

export type TransactionsContextValue = {
  transactions: Transaction[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  balance: number;
  totalIncome: number;
  totalExpenses: number;
  biggestExpense: number;
  transactionCount: number;
  recentTransactions: Transaction[];
  categoryBreakdown: CategoryBreakdownItem[];
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
  const { user, isBiometricLocked } = useAuthContext();
  const queryClient = useQueryClient();
  const queryKey = useMemo(() => TRANSACTIONS_QUERY_KEYS.list(user?.uid), [user?.uid]);
  const isEnabled = Boolean(user) && !isBiometricLocked;

  const transactionsQuery = useQuery({
    queryKey,
    queryFn: async () => queryClient.getQueryData<Transaction[]>(queryKey) ?? [],
    enabled: false,
    staleTime: Infinity,
  });

  const stream = useTransactionsStream(user?.uid, isEnabled);

  useEffect(() => {
    if (!isEnabled || stream.isLoading || stream.error) return;
    queryClient.setQueryData(queryKey, stream.transactions);
    void preloadTransactionReceipts(stream.transactions.slice(0, 10));
  }, [isEnabled, queryClient, queryKey, stream.error, stream.isLoading, stream.transactions]);

  const transactions = useMemo(
    () =>
      isEnabled && !stream.error
        ? transactionsQuery.data ?? stream.transactions
        : [],
    [isEnabled, stream.error, stream.transactions, transactionsQuery.data]
  );
  const isLoading = isEnabled && stream.isLoading && transactionsQuery.data === undefined;
  const isRefreshing = isEnabled && stream.isLoading && transactionsQuery.data !== undefined;
  const error = stream.error;
  const resubscribe = stream.resubscribe;

  const createTransaction = useCallback(
    async (input: TransactionFormValues): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');

      const id = await createTransactionWithReceipt(transactionRepository, user.uid, input);

      return id;
    },
    [user]
  );

  const updateTransaction = useCallback(
    async (
      id: string,
      input: TransactionFormValues,
      previousReceipt?: TransactionReceipt
    ): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');

      await updateTransactionWithReceipt(transactionRepository, user.uid, id, input, previousReceipt);
    },
    [user]
  );

  const deleteTransaction = useCallback(
    async (id: string, receiptPath?: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');

      await transactionRepository.deleteTransaction(user.uid, id, receiptPath);
    },
    [user]
  );

  const refreshTransactions = useCallback(async () => {
    if (isEnabled) resubscribe();
  }, [isEnabled, resubscribe]);

  const metrics = useMemo(() => calculateTransactionMetrics(transactions), [transactions]);

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
