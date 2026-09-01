import { createQueryKeys } from '@/lib/react-query';

import { CATEGORIES_MAP, type CategoryFilter, type CategoryId, type TransactionType } from './types';

export const TRANSACTIONS_QUERY_KEYS = createQueryKeys('transactions');

export const TRANSACTIONS_PAGE_SIZE = 10;

export const CATEGORY_OPTIONS: { value: CategoryId; label: string }[] = (
  Object.entries(CATEGORIES_MAP) as [string, string][]
).map(([id, label]) => ({ value: Number(id) as CategoryId, label }));

export const TRANSACTION_TYPE_OPTIONS: { value: TransactionType; label: string }[] = [
  { value: 'Deposit', label: 'Depósito' },
  { value: 'Transfer', label: 'Transferência' },
];

// Opções dos selects de filtro — incluem a opção "sem filtro" ('all'), que não existe nos
// selects do formulário de adicionar/editar (lá o tipo/categoria são sempre obrigatórios).
export const TRANSACTION_TYPE_FILTER_OPTIONS: { value: TransactionType | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  ...TRANSACTION_TYPE_OPTIONS,
];

export const CATEGORY_FILTER_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: 'all', label: 'Todas as categorias' },
  ...CATEGORY_OPTIONS,
];

export const ATTACHMENT_FILTER_OPTIONS: { value: 'all' | 'with' | 'without'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'with', label: 'Com anexo' },
  { value: 'without', label: 'Sem anexo' },
];
