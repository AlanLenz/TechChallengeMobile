import { useState } from 'react';

import type { TransactionFilters } from '../types';

const INITIAL_FILTERS: TransactionFilters = {
  description: '',
  startDate: undefined,
  endDate: undefined,
  type: 'all',
  categoryId: 'all',
  attachment: 'all',
};

/** Estado de UI dos filtros da listagem — não é estado de servidor, então fica fora do React
 * Query (ver docs/architecture.md, seção 6). `draft` é o que o usuário está editando nos campos;
 * `applied` só muda quando ele confirma em "Filtrar" ou "Limpar filtros", e é o que de fato
 * filtra a lista — permite editar vários campos sem refiltrar a cada tecla. */
export function useTransactionFilters() {
  const [draft, setDraft] = useState<TransactionFilters>(INITIAL_FILTERS);
  const [applied, setApplied] = useState<TransactionFilters>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);

  function setField<K extends keyof TransactionFilters>(key: K, value: TransactionFilters[K]) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function apply() {
    setApplied(draft);
    setPage(1);
  }

  function clear() {
    setDraft(INITIAL_FILTERS);
    setApplied(INITIAL_FILTERS);
    setPage(1);
  }

  return { draft, setField, applied, apply, clear, page, setPage };
}
