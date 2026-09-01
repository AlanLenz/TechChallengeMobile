import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { ROUTES } from '@/constants/routes';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';

import { TRANSACTIONS_PAGE_SIZE } from '../constants';
import { useTransactionFilters } from '../hooks/use-transaction-filters';
import { useTransactions } from '../hooks/use-transactions';
import { filterTransactions, paginate } from '../utils';
import { TransactionFiltersPanel } from './transaction-filters-panel';
import { TransactionListItem } from './transaction-list-item';

export function TransactionsScreen() {
  const router = useRouter();
  const { data: transactions, isLoading } = useTransactions();
  const { draft, setField, applied, apply, clear, page, setPage } = useTransactionFilters();

  const filtered = useMemo(() => filterTransactions(transactions ?? [], applied), [transactions, applied]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / TRANSACTIONS_PAGE_SIZE));
  // Se os filtros/dados mudarem e a página atual ficar fora do intervalo, mostra a última
  // página válida em vez de uma lista vazia — sem precisar sincronizar isso via effect.
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(
    () => paginate(filtered, currentPage, TRANSACTIONS_PAGE_SIZE),
    [filtered, currentPage]
  );

  return (
    <TabScreenLayout
      title="Transações"
      headerRight={
        <Button
          label="+"
          onPress={() => router.push(ROUTES.MODALS.NEW_TRANSACTION)}
          className="px-3 py-1"
        />
      }>
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={paginated}
          keyExtractor={(transaction) => transaction.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <TransactionListItem transaction={item} />}
          ListHeaderComponent={
            <TransactionFiltersPanel filters={draft} onChange={setField} onApply={apply} onClear={clear} />
          }
          ListFooterComponent={
            filtered.length > 0 ? (
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                onPrev={() => setPage((current) => Math.max(1, current - 1))}
                onNext={() => setPage((current) => Math.min(totalPages, current + 1))}
              />
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon="swap-horizontal-outline"
              title="Nenhuma transação encontrada"
              description="Ajuste os filtros ou adicione uma nova transação."
            />
          }
        />
      )}
    </TabScreenLayout>
  );
}
