import { COLLECTIONS } from '@/constants/api';
import { queryCollection } from '@/firebase/firestore';
import type { Transfer } from '@/modules/transfers';

import type { AccountSummary } from '../types';

export async function getAccountsSummary(userId: string): Promise<AccountSummary[]> {
  return queryCollection<AccountSummary>(COLLECTIONS.ACCOUNTS, [
    { field: 'ownerId', op: '==', value: userId },
  ]);
}

export async function getTransfers(userId: string): Promise<Transfer[]> {
  return queryCollection<Transfer>(`users/${userId}/transactions`);
}

