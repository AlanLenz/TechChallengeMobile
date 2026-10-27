import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import {
  createTransactionWithReceipt,
  updateTransactionWithReceipt,
} from '../../application/transaction.use-cases';
import { TRANSACTIONS_QUERY_KEYS } from '../../constants';
import { transactionRepository } from '../../container';
import type { Transaction, TransactionReceipt } from '../../domain/entities/transaction.entity';
import type { TransactionFormValues } from '../../domain/entities/transaction.validation';
import {
  calculateTransactionMetrics,
  type CategoryBreakdownItem,
} from '../../domain/services/transaction-metrics.service';

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
    queryFn: () => (user ? transactionRepository.getTransactions(user.uid) : Promise.resolve([])),
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

  /**
   * Marca a lista como desatualizada e refaz a busca em segundo plano: quem salva não espera o
   * download da coleção inteira para ver a tela fechar. Falhas do refetch caem no estado de
   * erro da própria query, não na mutação que já foi concluída.
   */
  const invalidateTransactionQueries = useCallback(() => {
    if (!user) return;

    void queryClient.invalidateQueries({
      queryKey: TRANSACTIONS_QUERY_KEYS.list(user.uid),
      exact: true,
    });
  }, [queryClient, user]);

  const createTransaction = useCallback(
    async (input: TransactionFormValues): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');

      const id = await createTransactionWithReceipt(transactionRepository, user.uid, input);

      invalidateTransactionQueries();
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

      await updateTransactionWithReceipt(transactionRepository, user.uid, id, input, previousReceipt);

      invalidateTransactionQueries();
    },
    [invalidateTransactionQueries, user]
  );

  const deleteTransaction = useCallback(
    async (id: string, receiptPath?: string): Promise<void> => {
      if (!user) throw new Error('Usuário não autenticado.');

      await transactionRepository.deleteTransaction(user.uid, id, receiptPath);

      // O item já foi removido no servidor: tira da lista agora para não reaparecer até o refetch.
      queryClient.setQueryData<Transaction[]>(TRANSACTIONS_QUERY_KEYS.list(user.uid), (current) =>
        current?.filter((transaction) => transaction.id !== id)
      );
      invalidateTransactionQueries();
    },
    [invalidateTransactionQueries, queryClient, user]
  );

  const refreshTransactions = useCallback(async () => {
    if (!user) return;
    await queryClient.refetchQueries({
      queryKey: TRANSACTIONS_QUERY_KEYS.list(user.uid),
      exact: true,
    });
  }, [queryClient, user]);

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
