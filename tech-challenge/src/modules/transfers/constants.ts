import { createQueryKeys } from '@/lib/react-query';

import { CATEGORIES_MAP, type CategoryId, type TransferType } from './types';

export const TRANSFERS_QUERY_KEYS = createQueryKeys('transfers');

export const CATEGORY_OPTIONS: { value: CategoryId; label: string }[] = (
  Object.entries(CATEGORIES_MAP) as [string, string][]
).map(([id, label]) => ({ value: Number(id) as CategoryId, label }));

export const TRANSFER_TYPE_OPTIONS: { value: TransferType; label: string }[] = [
  { value: 'Deposit', label: 'Depósito' },
  { value: 'Transfer', label: 'Transferência' },
];
