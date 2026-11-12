import { COLLECTIONS } from '@/constants/api';
import {
  addDocument,
  deleteDocument,
  deleteFieldValue,
  getDocument,
  subscribeToCollection,
  updateDocument,
} from '@/firebase/firestore';
import { deleteFile, getFileUrl, getStorageErrorMessage, uploadFile } from '@/firebase/storage';

import { getReceiptStoragePath } from '../../constants';
import type { CategoryId, Transaction, TransactionReceipt } from '../../domain/entities/transaction.entity';
import {
  resolveReceiptMimeType,
  storedFileExtension,
  type ReceiptFileInput,
} from '../../domain/rules/receipt.rules';
import type { TransactionFormValues } from '../../domain/entities/transaction.validation';
import { decryptSensitiveText, encryptSensitiveText } from '@/utils/crypto';
import { parseCurrencyToNumber } from '@/utils/mask';

import type { ITransactionRepository, Unsubscribe } from '../../domain/repositories/transaction.repository';

/** Sufixo aleatório curto para evitar colisão de nomes no Storage (sem dependência de uuid). */
function randomFileSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

function transactionsPath(userId: string): string {
  return `users/${userId}/${COLLECTIONS.TRANSACTIONS}`;
}

/**
 * Campos de domínio da transação persistidos no Firestore.
 * A descrição (`description`) contém detalhes pessoais/financeiros sensíveis do lançamento e é
 * criptografada em nível de aplicação (`enc:v1:...`) vinculada ao `userId` antes do envio.
 */
function toDocumentData(userId: string, input: TransactionFormValues) {
  return {
    description: encryptSensitiveText(input.description.trim(), userId),
    amount: parseCurrencyToNumber(input.amount),
    date: input.date,
    type: input.type,
    categories_id: input.categoriesId as CategoryId,
  };
}

/** Descriptografa de forma transparente os campos sensíveis de uma transação lida do Firestore. */
function fromDocumentData(userId: string, transaction: Transaction): Transaction {
  return {
    ...transaction,
    description: decryptSensitiveText(transaction.description, userId),
    receipt: transaction.receipt
      ? {
          ...transaction.receipt,
          name: decryptSensitiveText(transaction.receipt.name, userId),
        }
      : undefined,
  };
}

function subscribeToTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  return subscribeToCollection<Transaction>(
    transactionsPath(userId),
    (docs) => onData(docs.map((doc) => fromDocumentData(userId, doc))),
    onError
  );
}

async function getTransaction(userId: string, id: string): Promise<Transaction | null> {
  const doc = await getDocument<Transaction>(transactionsPath(userId), id);
  return doc ? fromDocumentData(userId, doc) : null;
}

async function createTransaction(userId: string, input: TransactionFormValues): Promise<string> {
  return addDocument(transactionsPath(userId), toDocumentData(userId, input));
}

async function updateTransaction(
  userId: string,
  id: string,
  input: TransactionFormValues,
  receipt: TransactionReceipt | undefined,
  hadReceipt: boolean
): Promise<void> {
  const data: Record<string, unknown> = toDocumentData(userId, input);

  if (receipt) {
    data.receipt = {
      ...receipt,
      name: encryptSensitiveText(receipt.name, userId),
    };
  } else if (hadReceipt) {
    // Comprovante removido pelo usuário — apaga o campo (o SDK não aceita `undefined`).
    data.receipt = deleteFieldValue();
  }

  return updateDocument(transactionsPath(userId), id, data);
}

async function deleteTransaction(userId: string, id: string, receiptPath?: string): Promise<void> {
  if (receiptPath) {
    await deleteTransactionReceipt(receiptPath);
  }

  return deleteDocument(transactionsPath(userId), id);
}

/**
 * Envia o arquivo ao Firebase Storage sob `users/{uid}/transactions/{id}/receipts/{nome-único}`
 * e devolve a referência a ser persistida na transação. Lança `Error` com mensagem de domínio.
 */
async function uploadTransactionReceipt(
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
      customMetadata: { originalName: encryptSensitiveText(file.name, userId) },
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
async function deleteTransactionReceipt(path: string): Promise<void> {
  try {
    await deleteFile(path);
  } catch {
    // silencioso de propósito — arquivo órfão é tolerável, bloquear a ação do usuário não é.
  }
}

export const firebaseTransactionRepository: ITransactionRepository = {
  subscribeToTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  uploadTransactionReceipt,
  deleteTransactionReceipt,
};
