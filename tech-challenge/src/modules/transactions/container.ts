import type { ITransactionRepository } from './domain/repositories/transaction.repository';
import { firebaseTransactionRepository } from './infrastructure/firebase/firebase-transaction.repository';

/** Composition root do module: único ponto que escolhe a implementação concreta do repositório. */
export const transactionRepository: ITransactionRepository = firebaseTransactionRepository;
