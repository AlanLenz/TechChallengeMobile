import { createQueryKeys } from '@/lib/react-query';

export const TRANSFERS_QUERY_KEYS = createQueryKeys('transfers');

export const CATEGORIES = [
  { value: 1, label: 'Alimentação' },
  { value: 2, label: 'Transporte' },
  { value: 3, label: 'Moradia' },
  { value: 4, label: 'Saúde' },
  { value: 5, label: 'Educação' },
  { value: 6, label: 'Lazer' },
  { value: 7, label: 'Outros' },
] as const;

export const TRANSACTION_TYPES = [
  { value: 'deposit', label: 'Depósito' },
  { value: 'transfer', label: 'Transferência' },
  { value: 'withdraw', label: 'Saque' },
] as const;