import { COLLECTIONS } from '@/constants/api';
import {
  addDocument,
  deleteDocument,
  deleteFieldValue,
  getDocument,
  queryCollection,
  updateDocument,
} from '@/firebase/firestore';
import { deleteFile, getFileUrl, getStorageErrorMessage, uploadFile } from '@/firebase/storage';

import type {
  ReceiptFileInput,
  Transaction,
  TransactionInput,
  TransactionReceipt,
} from '../../domain/entities/transaction.entity';
import type { ITransactionRepository } from '../../domain/repositories/transaction.repository';
import { resolveReceiptMimeType, storedFileExtension } from '../../domain/rules/receipt.rules';

/** Caminho no Storage: espelha o modelo per-user do Firestore (`users/{uid}/transactions/...`). */
function getReceiptStoragePath(userId: string, transactionId: string, fileName: string): string {
  return `users/${userId}/${COLLECTIONS.TRANSACTIONS}/${transactionId}/receipts/${fileName}`;
}

/** Sufixo aleatório curto para evitar colisão de nomes no Storage (sem dependência de uuid). */
function randomFileSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

function transactionsPath(userId: string): string {
  return `users/${userId}/${COLLECTIONS.TRANSACTIONS}`;
}

/** Campos de domínio da transação — sem `receiptFile`/`receipt`, tratados à parte. */
function toDocumentData(input: TransactionInput) {
  return {
    description: input.description.trim(),
    amount: input.amount,
    date: input.date,
    type: input.type,
    categories_id: input.categoriesId,
  };
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
  return queryCollection<Transaction>(transactionsPath(userId));
}

export async function getTransaction(userId: string, id: string): Promise<Transaction | null> {
  return getDocument<Transaction>(transactionsPath(userId), id);
}

export async function createTransaction(userId: string, input: TransactionInput): Promise<string> {
  return addDocument(transactionsPath(userId), toDocumentData(input));
}

export async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionInput,
  receipt: TransactionReceipt | undefined,
  hadReceipt: boolean
): Promise<void> {
  const data: Record<string, unknown> = toDocumentData(input);

  if (receipt) {
    data.receipt = receipt;
  } else if (hadReceipt) {
    // Comprovante removido pelo usuário — apaga o campo (o SDK não aceita `undefined`).
    data.receipt = deleteFieldValue();
  }

  return updateDocument(transactionsPath(userId), id, data);
}

export async function deleteTransaction(userId: string, id: string): Promise<void> {
  return deleteDocument(transactionsPath(userId), id);
}

/**
 * Envia o arquivo ao Firebase Storage sob `users/{uid}/transactions/{id}/receipts/{nome-único}`
 * e devolve a referência a ser persistida na transação. Lança `Error` com mensagem de domínio.
 */
export async function uploadTransactionReceipt(
  userId: string,
  transactionId: string,
  file: ReceiptFileInput
): Promise<TransactionReceipt> {
  const storedName = `${Date.now()}-${randomFileSuffix()}.${storedFileExtension(file)}`;
  const path = getReceiptStoragePath(userId, transactionId, storedName);
  const contentType = resolveReceiptMimeType(file) ?? 'application/octet-stream';

  const blob = await (await fetch(file.uri)).blob();
  if (blob.size === 0) {
    throw new Error('O arquivo está vazio.');
  }

  try {
    await uploadFile(path, blob, {
      contentType,
      customMetadata: { originalName: file.name },
    });
  } catch (error) {
    throw new Error(getStorageErrorMessage(error));
  }

  try {
    const url = await getFileUrl(path);
    return { name: file.name, url, path, contentType };
  } catch {
    // Arquivo já está no Storage, mas não conseguimos o link — remove para não deixar órfão.
    await deleteTransactionReceipt(path);
    throw new Error('Não foi possível gerar o link do comprovante. Tente novamente.');
  }
}

/** Remove um comprovante do Storage. Best-effort: uma falha aqui não deve travar o fluxo. */
export async function deleteTransactionReceipt(path: string): Promise<void> {
  try {
    await deleteFile(path);
  } catch {
    // silencioso de propósito — arquivo órfão é tolerável, bloquear a ação do usuário não é.
  }
}

export const firebaseTransactionRepository: ITransactionRepository = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionReceipt,
  deleteTransactionReceipt,
};
