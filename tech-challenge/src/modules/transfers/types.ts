import type { WithId } from '@/types/api';

export type Transfer = WithId<{
  description: string;
  amount: number;
  date: number;
  type: TransactionType;
  category: string;
  receiptUrl?: string;
  createdAt: number;
}>;

export type TransactionType =
  | 'deposit'
  | 'transfer'
  | 'withdraw';