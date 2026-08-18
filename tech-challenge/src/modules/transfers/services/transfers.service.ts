import { queryCollection, setDocument } from '@/firebase/firestore';

import type { Transfer } from '../types';
import type { CreateTransferFormValues } from '../validations';

export async function getTransfers(userId: string): Promise<Transfer[]> {
  return queryCollection<Transfer>(
    `users/${userId}/transactions`
  );
}

export async function createTransfer(
  userId: string,
  input: CreateTransferFormValues
): Promise<void> {
  const id = `${userId}-${Date.now()}`;

  await setDocument(
    `users/${userId}/transactions`,
    id,
    {
      fromAccountId: input.fromAccountId,
      toAccountId: input.toAccountId,
      amount: Number(input.amount.replace(',', '.')),
      createdAt: Date.now(),
    }
  );
}