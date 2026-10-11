import type { WithId } from '@/types/api';

export type TransactionType = 'Deposit' | 'Transfer';

export function isDepositType(type?: string): boolean {
  return String(type).toLowerCase() === 'deposit';
}

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const CATEGORIES_MAP: Record<CategoryId, string> = {
  1: 'Alimentação',
  2: 'Transporte',
  3: 'Moradia',
  4: 'Saúde',
  5: 'Educação',
  6: 'Lazer',
  7: 'Outros',
};

/** Recibo/comprovante anexado a uma transação, armazenado no Firebase Storage. */
export type TransactionReceipt = {
  /** Nome original do arquivo escolhido pelo usuário — só metadado, para exibição. */
  name: string;
  /** Download URL público (com token) do Firebase Storage. */
  url: string;
  /** Caminho completo no Storage — usado para reabrir ou apagar o arquivo. */
  path: string;
  /** MIME type do arquivo (ex.: 'application/pdf', 'image/jpeg'). */
  contentType: string;
};

export type Transaction = WithId<{
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categories_id?: CategoryId;
  receipt?: TransactionReceipt;
}>;

/** Sentinela "all" representa "sem filtro" nos selects de filtro — não é um valor de domínio. */
export type TransactionTypeFilter = TransactionType | 'all';
export type CategoryFilter = CategoryId | 'all';
export type AttachmentFilter = 'all' | 'with' | 'without';

export type TransactionFilters = {
  description: string;
  startDate?: string;
  endDate?: string;
  type: TransactionTypeFilter;
  categoryId: CategoryFilter;
  attachment: AttachmentFilter;
};
