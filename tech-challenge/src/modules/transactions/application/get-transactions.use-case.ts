import type { Transaction } from '../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';

export class GetTransactionsUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  execute(userId: string): Promise<Transaction[]> {
    return this.repository.getTransactions(userId);
  }
}
