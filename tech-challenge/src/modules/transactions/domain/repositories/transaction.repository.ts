import type { Transaction, TransactionReceipt } from '../entities/transaction.entity';
import type { TransactionFormValues } from '../entities/transaction.validation';
import type { ReceiptFileInput } from '../rules/receipt.rules';

export type Unsubscribe = () => void;

export interface ITransactionRepository {
  /**
   * Fluxo reativo das transações do usuário: `onData` é chamado com a lista completa a cada
   * mudança (remota ou local). Devolve a função que encerra a assinatura.
   */
  subscribeToTransactions(
    userId: string,
    onData: (transactions: Transaction[]) => void,
    onError: (error: Error) => void
  ): Unsubscribe;
  getTransaction(userId: string, id: string): Promise<Transaction | null>;
  createTransaction(userId: string, input: TransactionFormValues): Promise<string>;
  updateTransaction(
    userId: string,
    id: string,
    input: TransactionFormValues,
    receipt: TransactionReceipt | undefined,
    hadReceipt: boolean
  ): Promise<void>;
  deleteTransaction(userId: string, id: string, receiptPath?: string): Promise<void>;
  uploadTransactionReceipt(userId: string, transactionId: string, file: ReceiptFileInput): Promise<TransactionReceipt>;
  deleteTransactionReceipt(path: string): Promise<void>;
}

