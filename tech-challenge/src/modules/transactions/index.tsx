import { preloadImages } from '@/services/preload.service';
import type { Transaction } from './domain/entities/transaction.entity';

export { EditTransactionScreen } from './presentation/components/edit-transaction-screen';
export { NewTransactionScreen } from './presentation/components/new-transaction-screen';
export { TransactionForm } from './presentation/components/transaction-form';
export { TransactionsScreen } from './presentation/components/transactions-screen';
export { CATEGORY_OPTIONS, TRANSACTION_TYPE_OPTIONS } from './constants';
export { CATEGORIES_MAP, isDepositType } from './domain/entities/transaction.entity';
export { computeTransactionMetrics } from './domain/rules/transaction-metrics';
export type { CategoryBreakdownItem } from './domain/rules/transaction-metrics';
export type {
  CategoryId,
  Transaction,
  TransactionFilters,
  TransactionInput,
  TransactionReceipt,
  TransactionType,
} from './domain/entities/transaction.entity';
export { transactionFormSchema, validateDateRange } from './presentation/validation/transaction.validation';
export type { TransactionFormValues } from './presentation/validation/transaction.validation';
export { transactionUseCases } from './container';

/**
 * Pré-carrega os módulos de telas e formulários de transações antecipadamente para navegação fluida.
 */
export function preloadTransactionsModule(): Promise<unknown> {
  return Promise.all([
    import('./presentation/components/transactions-screen'),
    import('./presentation/components/new-transaction-screen'),
    import('./presentation/components/edit-transaction-screen'),
  ]);
}

/**
 * Pré-carrega em lote as imagens de comprovantes anexados no cache nativo do dispositivo.
 */
export function preloadTransactionReceipts(transactions: Transaction[]): Promise<boolean[]> {
  const urls = transactions
    .map((t) => t.receipt?.url)
    .filter((url): url is string => Boolean(url));
  return preloadImages(urls);
}
