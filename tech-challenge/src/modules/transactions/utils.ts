import { endOfDay, startOfDay } from 'date-fns';

import { RECEIPT_ALLOWED_EXTENSIONS, RECEIPT_ALLOWED_MIME_TYPES } from './constants';
import { isDepositType, type Transaction, type TransactionFilters } from './types';

/** Arquivo selecionado pelo picker, antes do upload — formato normalizado interno do module. */
export type ReceiptFileInput = {
  uri: string;
  name: string;
  size?: number;
  mimeType?: string;
};

const EXTENSION_TO_MIME: Record<string, (typeof RECEIPT_ALLOWED_MIME_TYPES)[number]> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  pdf: 'application/pdf',
};

/** Extensão em minúsculas sem ponto, derivada do nome do arquivo (`''` se não houver). */
export function fileExtension(fileName: string): string {
  const match = /\.([a-z0-9]+)$/i.exec(fileName.trim());
  return match ? match[1].toLowerCase() : '';
}

/** Resolve o MIME type do arquivo: usa o informado pelo picker ou deduz pela extensão. */
export function resolveReceiptMimeType(file: ReceiptFileInput): string | undefined {
  if (file.mimeType) return file.mimeType;
  return EXTENSION_TO_MIME[fileExtension(file.name)];
}

/** `true` se o arquivo é um comprovante aceito (tipo permitido e, se conhecido, tamanho válido). */
export function isAllowedReceiptType(file: ReceiptFileInput): boolean {
  const mime = resolveReceiptMimeType(file);
  if (mime && (RECEIPT_ALLOWED_MIME_TYPES as readonly string[]).includes(mime)) return true;
  return (RECEIPT_ALLOWED_EXTENSIONS as readonly string[]).includes(fileExtension(file.name));
}

/** Extensão a usar no nome armazenado — a do arquivo, ou deduzida do MIME, ou 'bin'. */
export function storedFileExtension(file: ReceiptFileInput): string {
  const fromName = fileExtension(file.name);
  if (fromName) return fromName;
  const fromMime = Object.entries(EXTENSION_TO_MIME).find(([, mime]) => mime === file.mimeType);
  return fromMime ? fromMime[0] : 'bin';
}

/** Sufixo aleatório curto para evitar colisão de nomes no Storage (sem dependência de uuid). */
export function randomFileSuffix(): string {
  return Math.random().toString(36).slice(2, 10);
}

/** Tamanho legível para exibição (ex.: "1,4 MB"). */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(kb < 10 ? 1 : 0).replace('.', ',')} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(1).replace('.', ',')} MB`;
}

/** Filtro client-side: a listagem já carrega todas as transações do usuário via React Query
 * (não há paginação/filtro no lado do Firestore hoje — ver services/transactions.service.ts),
 * então combinar os filtros em memória é o que mantém a implementação consistente com o padrão
 * atual em vez de introduzir uma camada de query paralela. */
export function filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const description = filters.description.trim().toLowerCase();
  const start = filters.startDate ? startOfDay(new Date(filters.startDate)) : undefined;
  const end = filters.endDate ? endOfDay(new Date(filters.endDate)) : undefined;

  return transactions.filter((transaction) => {
    if (description && !transaction.description.toLowerCase().includes(description)) return false;

    const transactionDate = new Date(transaction.date);
    if (start && transactionDate < start) return false;
    if (end && transactionDate > end) return false;

    if (filters.type !== 'all' && isDepositType(transaction.type) !== isDepositType(filters.type)) return false;
    if (filters.categoryId !== 'all' && transaction.categories_id !== filters.categoryId) return false;

    if (filters.attachment === 'with' && !transaction.receipt) return false;
    if (filters.attachment === 'without' && transaction.receipt) return false;

    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
