import { CreateTransactionUseCase } from './application/create-transaction.use-case';
import { DeleteTransactionUseCase } from './application/delete-transaction.use-case';
import { GetTransactionsUseCase } from './application/get-transactions.use-case';
import { UpdateTransactionUseCase } from './application/update-transaction.use-case';
import { firebaseTransactionRepository } from './infrastructure/firebase/firebase-transaction.repository';

/**
 * Composition root do module: único ponto que conhece a implementação concreta (Firebase)
 * dos ports do domínio. A presentation só enxerga os use cases.
 */
const repository = firebaseTransactionRepository;

export const transactionUseCases = {
  getTransactions: new GetTransactionsUseCase(repository),
  createTransaction: new CreateTransactionUseCase(repository),
  updateTransaction: new UpdateTransactionUseCase(repository),
  deleteTransaction: new DeleteTransactionUseCase(repository),
};
