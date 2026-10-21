import type { TransactionInput } from '../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';

export class CreateTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  /** Cria a transação e, se houver arquivo, envia o comprovante e o vincula ao documento. */
  async execute(userId: string, input: TransactionInput): Promise<string> {
    const id = await this.repository.createTransaction(userId, input);

    if (input.receiptFile) {
      const receipt = await this.repository.uploadTransactionReceipt(userId, id, input.receiptFile);
      await this.repository.updateTransaction(userId, id, input, receipt, false);
    }

    return id;
  }
}
