import { COLLECTIONS } from '@/constants/api';
import { addDocument, queryCollection } from '@/firebase/firestore';

import type { CategoryId, Transfer } from '../types';
import type { TransferFormValues } from '../validations';

function transfersPath(userId: string): string {
  return `users/${userId}/${COLLECTIONS.TRANSFERS}`;
}

export async function getTransfers(userId: string): Promise<Transfer[]> {
  return queryCollection<Transfer>(transfersPath(userId));
}

export async function createTransfer(userId: string, input: TransferFormValues): Promise<string> {
  return addDocument(transfersPath(userId), {
    description: input.description,
    amount: Number(input.amount.replace(',', '.')),
    date: input.date,
    type: input.type,
    categories_id: input.categoriesId as CategoryId,
    ...(input.receiptUrl ? { receipt_url: input.receiptUrl } : {}),
  });
}
