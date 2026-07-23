import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';

import { useAccount } from '../hooks/use-account';

export function AccountDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { data: account, isLoading } = useAccount(id);

  return (
    <ScreenContainer edges={['top']} className="gap-4 px-0">
      <Header title="Detalhes da conta" onBack={() => router.back()} />
      <View className="flex-1 px-screen-x">
        {isLoading ? (
          <Loading />
        ) : !account ? (
          <EmptyState title="Conta não encontrada" />
        ) : (
          <Card className="gap-2">
            <Typography variant="small">{account.label}</Typography>
            <Typography variant="display">{formatCurrency(account.balance)}</Typography>
          </Card>
        )}
      </View>
    </ScreenContainer>
  );
}
