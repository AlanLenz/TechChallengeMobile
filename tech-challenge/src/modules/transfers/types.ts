import type { WithId } from '@/types/api';

export type CategoryId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type TransactionType = 'deposit' | 'transfer' | 'withdraw';

export type Transfer = WithId<{
  user_id: string;
  description: string;
  amount: number;
  date: string; // ISO date: YYYY-MM-DD
  type: TransactionType;
  categories_id: CategoryId;
  receipt_url?: string;
}>;

export type CreateTransferInput = Omit<Transfer, 'id' | 'user_id'>;
export type UpdateTransferInput = Partial<CreateTransferInput>;