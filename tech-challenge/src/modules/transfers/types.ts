import type { WithId } from '@/types/api';

export type Transfer = WithId<{
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  createdAt: number;
}>;
