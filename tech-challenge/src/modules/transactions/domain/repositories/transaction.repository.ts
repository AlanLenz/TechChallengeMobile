import type {
  ReceiptFileInput,
  Transaction,
  TransactionInput,
  TransactionReceipt,
} from '../entities/transaction.entity';

/** Port de persistência de transações e comprovantes — implementado na camada de infraestrutura. */
export interface ITransactionRepository {
  getTransactions(userId: string): Promise<Transaction[]>;
  getTransaction(userId: string, id: string): Promise<Transaction | null>;
  createTransaction(userId: string, input: TransactionInput): Promise<string>;
  updateTransaction(
    userId: string,
    id: string,
    input: TransactionInput,
    receipt: TransactionReceipt | undefined,
    hadReceipt: boolean
  ): Promise<void>;
  deleteTransaction(userId: string, id: string): Promise<void>;
  uploadTransactionReceipt(
    userId: string,
    transactionId: string,
    file: ReceiptFileInput
  ): Promise<TransactionReceipt>;
  /** Best-effort: uma falha ao apagar o arquivo não deve travar o fluxo do usuário. */
  deleteTransactionReceipt(path: string): Promise<void>;
}
