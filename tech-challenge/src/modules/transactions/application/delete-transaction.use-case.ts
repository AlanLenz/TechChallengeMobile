import type { ITransactionRepository } from '../domain/repositories/transaction.repository';

export class DeleteTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  /** Apaga o comprovante (se houver) junto com a transação. */
  async execute(userId: string, id: string, receiptPath?: string): Promise<void> {
    if (receiptPath) {
      await this.repository.deleteTransactionReceipt(receiptPath);
    }
    await this.repository.deleteTransaction(userId, id);
  }
}
