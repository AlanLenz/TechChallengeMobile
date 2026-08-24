import type { WithId } from '@/types/api';

export type TransferType = 'Deposit' | 'Transfer';

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

export type Transfer = WithId<{
  description: string;
  amount: number;
  date: string;
  type: TransferType;
  categories_id?: CategoryId;
  receipt_url?: string;
}>;
