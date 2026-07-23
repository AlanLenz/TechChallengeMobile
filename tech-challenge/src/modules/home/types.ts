import type { WithId } from '@/types/api';

export type AccountSummary = WithId<{
  ownerId: string;
  label: string;
  balance: number;
}>;
