import { COLLECTIONS } from '@/constants/api';
import { queryCollection } from '@/firebase/firestore';

import type { AccountSummary } from '../../domain/entities/home.entity';
import type { IAccountRepository } from '../../domain/repositories/account.repository';

export const firebaseAccountRepository: IAccountRepository = {
  getAccountsSummary: (userId) =>
    queryCollection<AccountSummary>(COLLECTIONS.ACCOUNTS, [
      { field: 'ownerId', op: '==', value: userId },
    ]),
};
