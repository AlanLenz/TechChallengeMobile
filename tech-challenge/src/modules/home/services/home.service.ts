import { COLLECTIONS } from '@/constants/api';
import { queryCollection } from '@/firebase/firestore';

import type { AccountSummary } from '../types';

export async function getAccountsSummary(userId: string): Promise<AccountSummary[]> {
  return queryCollection<AccountSummary>(COLLECTIONS.ACCOUNTS, [
    { field: 'ownerId', op: '==', value: userId },
  ]);
}
