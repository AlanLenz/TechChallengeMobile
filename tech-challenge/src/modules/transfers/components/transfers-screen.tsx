import { useState } from 'react';
import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/auth-context';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';

import { useTransfers } from '../hooks/use-transfers';
import type { Transfer } from '../types';
import { TransferEditModal } from './transfer-edit-modal';
import { TransferListItem } from './transfer-list-item';

export function TransfersScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer | null>(null);

  const { data: transfers, isLoading } = useTransfers(user?.uid);

  return (
    <>
      <TabScreenLayout
        title="Transações"
        headerRight={
          <Button
            label="+"
            onPress={() => router.push(ROUTES.MODALS.NEW_TRANSFER)}
            className="px-3 py-1"
          />
        }>
        {isLoading ? (
          <Loading />
        ) : (
          <FlatList
            data={transfers ?? []}
            keyExtractor={(transfer) => transfer.id}
            contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
            renderItem={({ item }) => (
              <TransferListItem
                transfer={item}
                onPress={setSelectedTransfer}
              />
            )}
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

      <TransferEditModal
        transfer={selectedTransfer}
        onClose={() => setSelectedTransfer(null)}
      />
    </>
  );
}

