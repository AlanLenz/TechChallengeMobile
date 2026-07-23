import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';
import { useAccounts } from '@/modules/accounts';

import { useTransfers } from '../hooks/use-transfers';
import { TransferListItem } from './transfer-list-item';

export function TransfersScreen() {
  const router = useRouter();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const primaryAccountId = accounts?.[0]?.id;
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers(primaryAccountId);

  const isLoading = isLoadingAccounts || (Boolean(primaryAccountId) && isLoadingTransfers);

  return (
    <TabScreenLayout
      title="Transferências"
      headerRight={
        <Button
          label="+"
          onPress={() => router.push(ROUTES.MODALS.NEW_TRANSFER)}
          className="px-3 py-1"
        />
      }>
      {isLoading ? (
        <Loading />
      ) : !primaryAccountId ? (
        <EmptyState
          icon="swap-horizontal-outline"
          title="Nenhuma conta disponível"
          description="Cadastre uma conta para começar a transferir."
        />
      ) : (
        <FlatList
          data={transfers ?? []}
          keyExtractor={(transfer) => transfer.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => <TransferListItem transfer={item} />}
          ListEmptyComponent={
            <EmptyState
              icon="swap-horizontal-outline"
              title="Nenhuma transferência ainda"
              description="Suas transferências aparecem aqui assim que forem realizadas."
            />
          }
        />
      )}
    </TabScreenLayout>
  );
}
