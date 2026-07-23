import { COLLECTIONS } from '@/constants/api';
import { queryCollection, setDocument } from '@/firebase/firestore';

import type { Transfer } from '../types';
import type { CreateTransferFormValues } from '../validations';

export async function getTransfers(accountId: string): Promise<Transfer[]> {
  return queryCollection<Transfer>(COLLECTIONS.TRANSFERS, [
    { field: 'fromAccountId', op: '==', value: accountId },
  ]);
}

export async function createTransfer(userId: string, input: CreateTransferFormValues): Promise<void> {
  const id = `${userId}-${Date.now()}`;
  await setDocument<Transfer>(COLLECTIONS.TRANSFERS, id, {
    fromAccountId: input.fromAccountId,
    toAccountId: input.toAccountId,
    amount: Number(input.amount.replace(',', '.')),
    createdAt: Date.now(),
  });
}
