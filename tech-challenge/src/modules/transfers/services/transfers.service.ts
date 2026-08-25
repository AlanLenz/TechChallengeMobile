import { addDocument, deleteDocument, queryCollection, updateDocument } from '@/firebase/firestore';

import type { Transfer } from '../types';
import type { CreateTransferFormValues, UpdateTransferFormValues } from '../validations';

const transfersPath = (userId: string) => `users/${userId}/transactions`;

/** "R$ 1.234,56" → 1234.56 */
function parseBrlAmount(masked: string): number {
  const digits = masked.replace(/\D/g, ''); // strip everything except digits
  return Number(digits) / 100;
}

/** "DD/MM/YYYY" → "YYYY-MM-DD" */
function toIsoDate(ddmmyyyy: string): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}`;
}

export async function getTransfers(userId: string): Promise<Transfer[]> {
  return queryCollection<Transfer>(transfersPath(userId));
}

export async function createTransfer(
  userId: string,
  input: CreateTransferFormValues
): Promise<void> {
  await addDocument(transfersPath(userId), {
    user_id: userId,
    description: input.description,
    amount: parseBrlAmount(input.amount),
    date: toIsoDate(input.date),
    type: input.type,
    categories_id: input.categories_id,
    receipt_url: input.receipt_url ?? '',
  });
}

export async function updateTransfer(
  userId: string,
  transferId: string,
  input: UpdateTransferFormValues
): Promise<void> {
  const data: Record<string, unknown> = {};
  if (input.description !== undefined) data.description = input.description;
  if (input.amount !== undefined) data.amount = parseBrlAmount(input.amount);
  if (input.date !== undefined) data.date = toIsoDate(input.date);
  if (input.type !== undefined) data.type = input.type;
  if (input.categories_id !== undefined) data.categories_id = input.categories_id;
  if (input.receipt_url !== undefined) data.receipt_url = input.receipt_url;

  await updateDocument(transfersPath(userId), transferId, data);
}

export async function deleteTransfer(
  userId: string,
  transferId: string
): Promise<void> {
  await deleteDocument(transfersPath(userId), transferId);
}