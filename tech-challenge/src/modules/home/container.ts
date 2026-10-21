import { GetAccountsSummaryUseCase } from './application/get-accounts-summary.use-case';
import { firebaseAccountRepository } from './infrastructure/firebase/firebase-home-repository';

/** Composition root do module: liga os use cases à implementação Firebase do port de contas. */
export const homeUseCases = {
  getAccountsSummary: new GetAccountsSummaryUseCase(firebaseAccountRepository),
};
