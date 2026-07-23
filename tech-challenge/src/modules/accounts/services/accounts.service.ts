import { COLLECTIONS } from '@/constants/api';
import { getDocument, queryCollection } from '@/firebase/firestore';

import type { Account } from '../types';

export async function getAccounts(userId: string): Promise<Account[]> {
  return queryCollection<Account>(COLLECTIONS.ACCOUNTS, [{ field: 'ownerId', op: '==', value: userId }]);
}

export async function getAccountById(id: string): Promise<Account | null> {
  return getDocument<Account>(COLLECTIONS.ACCOUNTS, id);
}
