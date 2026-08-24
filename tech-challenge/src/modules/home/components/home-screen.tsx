import { useRouter } from 'expo-router';
import { View } from 'react-native';
import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { Card } from '@/components/ui/card';
import { FloatingActionButton } from '@/components/ui/fab';
import { Typography } from '@/components/ui/typography';
import { ScreenContainer } from '@/components/layout/screen-container';
import { ROUTES } from '@/constants/routes';
import { formatCurrency } from '@/utils/format-currency';

import { useDashboardSummary } from '../hooks/use-dashboard-summary';

export function HomeScreen() {
  const router = useRouter();
  const { data: accounts, isLoading } = useDashboardSummary();

  const totalBalance = accounts?.reduce((sum, account) => sum + account.balance, 0) ?? 0;

  return (
    <ScreenContainer className="gap-4 pt-4">
      <View className="px-screen-x">
        <Typography variant="title">Olá 👋</Typography>
      </View>

      {isLoading ? (
        <Loading />
      ) : !accounts || accounts.length === 0 ? (
        <EmptyState
          icon="wallet-outline"
          title="Nenhuma conta encontrada"
          description="Assim que você tiver contas cadastradas, o resumo financeiro aparece aqui."
        />
      ) : (
        <Card className="gap-1">
          <Typography variant="small">Saldo total</Typography>
          <Typography variant="display">{formatCurrency(totalBalance)}</Typography>
        </Card>
      )}

      <FloatingActionButton
        accessibilityLabel="Adicionar transferência"
        onPress={() => router.push(ROUTES.MODALS.NEW_TRANSFER)}
      />
    </ScreenContainer>
  );
}
