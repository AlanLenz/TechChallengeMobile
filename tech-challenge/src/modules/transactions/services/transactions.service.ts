import { COLLECTIONS } from '@/constants/api';
import { addDocument, deleteDocument, getDocument, queryCollection, updateDocument } from '@/firebase/firestore';

import type { CategoryId, Transaction } from '../types';
import type { TransactionFormValues } from '../validations';

function transactionsPath(userId: string): string {
  return `users/${userId}/${COLLECTIONS.TRANSACTIONS}`;
}

function toDocumentData(input: TransactionFormValues) {
  return {
    description: input.description,
    amount: Number(input.amount.replace(',', '.')),
    date: input.date,
    type: input.type,
    categories_id: input.categoriesId as CategoryId,
    ...(input.receiptUrl ? { receipt_url: input.receiptUrl } : {}),
  };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  return queryCollection<Transaction>(transactionsPath(userId));
}

export async function getTransaction(userId: string, id: string): Promise<Transaction | null> {
  return getDocument<Transaction>(transactionsPath(userId), id);
}

export async function createTransaction(userId: string, input: TransactionFormValues): Promise<string> {
  return addDocument(transactionsPath(userId), toDocumentData(input));
}

export async function updateTransaction(userId: string, id: string, input: TransactionFormValues): Promise<void> {
  return updateDocument(transactionsPath(userId), id, toDocumentData(input));
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  return deleteDocument(transactionsPath(userId), id);
}
