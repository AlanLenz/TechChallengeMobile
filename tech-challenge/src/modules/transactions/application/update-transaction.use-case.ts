import type { TransactionInput, TransactionReceipt } from '../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';

export class UpdateTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  /**
   * Atualiza a transação, enviando um novo comprovante se houver e descartando o anterior
   * quando ele foi trocado ou removido.
   */
  async execute(
    userId: string,
    id: string,
    input: TransactionInput,
    previousReceipt?: TransactionReceipt
  ): Promise<void> {
    const receipt = input.receiptFile
      ? await this.repository.uploadTransactionReceipt(userId, id, input.receiptFile)
      : input.receipt;

    await this.repository.updateTransaction(userId, id, input, receipt, Boolean(previousReceipt));

    if (previousReceipt && previousReceipt.path !== receipt?.path) {
      await this.repository.deleteTransactionReceipt(previousReceipt.path);
    }
  }
}
