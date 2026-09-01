import { endOfDay, startOfDay } from 'date-fns';

import type { Transaction, TransactionFilters } from './types';

/** Filtro client-side: a listagem já carrega todas as transações do usuário via React Query
 * (não há paginação/filtro no lado do Firestore hoje — ver services/transactions.service.ts),
 * então combinar os filtros em memória é o que mantém a implementação consistente com o padrão
 * atual em vez de introduzir uma camada de query paralela. */
export function filterTransactions(transactions: Transaction[], filters: TransactionFilters): Transaction[] {
  const description = filters.description.trim().toLowerCase();
  const start = filters.startDate ? startOfDay(new Date(filters.startDate)) : undefined;
  const end = filters.endDate ? endOfDay(new Date(filters.endDate)) : undefined;

  return transactions.filter((transaction) => {
    if (description && !transaction.description.toLowerCase().includes(description)) return false;

    const transactionDate = new Date(transaction.date);
    if (start && transactionDate < start) return false;
    if (end && transactionDate > end) return false;

    if (filters.type !== 'all' && transaction.type !== filters.type) return false;
    if (filters.categoryId !== 'all' && transaction.categories_id !== filters.categoryId) return false;

    if (filters.attachment === 'with' && !transaction.receipt_url) return false;
    if (filters.attachment === 'without' && transaction.receipt_url) return false;

    return true;
  });
}

export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}
