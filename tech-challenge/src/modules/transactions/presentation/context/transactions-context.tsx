import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import { useAuthContext } from '@/contexts/auth-context';

import {
  createTransactionWithReceipt,
  updateTransactionWithReceipt,
} from '../../application/transaction.use-cases';
import { transactionRepository } from '../../container';
import type { Transaction, TransactionReceipt } from '../../domain/entities/transaction.entity';
import type { TransactionFormValues } from '../../domain/entities/transaction.validation';
import {
  calculateTransactionMetrics,
  type CategoryBreakdownItem,
} from '../../domain/services/transaction-metrics.service';
import { useTransactionsStream } from '../hooks/use-transactions-stream';

export type { CategoryBreakdownItem };

export type TransactionsContextValue = {
  transactions: Transaction[];
  isLoading: boolean;
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
  const { user, isBiometricLocked } = useAuthContext();

  // Fluxo reativo: a lista é empurrada pelo repositório a cada mudança, então as ações CRUD
  // abaixo só escrevem — não precisam invalidar nem refazer a busca.
  const { transactions, isLoading, error, resubscribe } = useTransactionsStream(
    user?.uid,
    Boolean(user) && !isBiometricLocked
  );

  const createTransaction = useCallback(
    async (input: TransactionFormValues): Promise<string> => {
      if (!user) throw new Error('Usuário não autenticado.');

      return createTransactionWithReceipt(transactionRepository, user.uid, input);
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

  /** Reinicia a assinatura (útil para "tentar novamente" após um erro de conexão/permissão). */
  const refreshTransactions = useCallback(async () => {
    resubscribe();
  }, [resubscribe]);

  const metrics = useMemo(() => calculateTransactionMetrics(transactions), [transactions]);

  const value = useMemo<TransactionsContextValue>(
    () => ({
      transactions,
      isLoading,
      error,
      ...metrics,
      createTransaction,
      updateTransaction,
      deleteTransaction,
      refreshTransactions,
    }),
    [transactions, isLoading, error, metrics, createTransaction, updateTransaction, deleteTransaction, refreshTransactions]
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
