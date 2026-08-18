import { createQueryKeys } from '@/lib/react-query';

export const TRANSFERS_QUERY_KEYS = createQueryKeys('transfers');

export const CATEGORIES = [
  { value: 'food', label: 'Alimentação' },
  { value: 'transport', label: 'Transporte' },
  { value: 'housing', label: 'Moradia' },
  { value: 'health', label: 'Saúde' },
  { value: 'education', label: 'Educação' },
  { value: 'leisure', label: 'Lazer' },
  { value: 'other', label: 'Outros' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'deposit', label: 'Depósito' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'withdraw', label: 'Saque' },
] as const;