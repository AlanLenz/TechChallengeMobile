import type { WithId } from '@/types/api';

export type TransactionType = 'Deposit' | 'Transfer';

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

export type Transaction = WithId<{
  description: string;
  amount: number;
  date: string;
  type: TransactionType;
  categories_id?: CategoryId;
  receipt_url?: string;
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
