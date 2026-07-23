import type { WithId } from '@/types/api';

export type Account = WithId<{
  ownerId: string;
  label: string;
  type: 'checking' | 'savings';
  balance: number;
}>;
