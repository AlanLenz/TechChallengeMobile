import { useRouter } from 'expo-router';
import { FlatList } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';

import { useAccounts } from '../hooks/use-accounts';
import { AccountListItem } from './account-list-item';

export function AccountsScreen() {
  const router = useRouter();
  const { data: accounts, isLoading } = useAccounts();

  return (
    <TabScreenLayout title="Contas">
      {isLoading ? (
        <Loading />
      ) : (
        <FlatList
          data={accounts ?? []}
          keyExtractor={(account) => account.id}
          contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
          renderItem={({ item }) => (
            <AccountListItem account={item} onPress={() => router.push(`/(tabs)/accounts/${item.id}`)} />
          )}
          ListEmptyComponent={
            <EmptyState
              icon="card-outline"
              title="Nenhuma conta cadastrada"
              description="Suas contas aparecem aqui assim que forem criadas."
            />
          }
        />
      )}
    </TabScreenLayout>
  );
}
