import { useRouter } from 'expo-router';
import { View , ScrollView} from 'react-native';
import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { FloatingActionButton } from '@/components/ui/fab';
import { ScreenContainer } from '@/components/layout/screen-container';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/auth-context';

import { useHomeDashboard } from '../hooks/use-home-dashboard';
import { CategoryChart } from './category-chart';
import { HeroCard } from './hero-card';
import { IncomeExpenseChart } from './income-expense-chart';
import { RecentTransactionsList } from './recent-transactions-list';
import { StatsGrid } from './stats-grid';

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: stats, isPending, isError } = useHomeDashboard();

  const firstName = (user?.displayName ?? user?.email ?? 'Usuário').split(' ')[0];

  if (isPending) {
    return (
      <ScreenContainer className="justify-center">
        <Loading />
      </ScreenContainer>
    );
  }

  if (isError || !stats) {
    return (
      <ScreenContainer className="justify-center">
        <EmptyState
          icon="alert-circle-outline"
          title="Erro ao carregar"
          description="Não foi possível carregar o dashboard. Tente novamente."
        />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="px-0">
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingHorizontal: 16, paddingBottom: 32, paddingTop: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroCard firstName={firstName} balance={stats.totalBalance} />

        <StatsGrid
          totalIncome={stats.totalIncome}
          totalExpenses={stats.totalExpenses}
          biggestExpense={stats.biggestExpense}
          transactionCount={stats.transactionCount}
        />

        <View className="gap-4">
          <IncomeExpenseChart
            totalIncome={stats.totalIncome}
            totalExpenses={stats.totalExpenses}
          />
          <CategoryChart data={stats.categoryBreakdown} />
        </View>

        <RecentTransactionsList transactions={stats.recentTransactions} />
      </ScrollView>
      <FloatingActionButton
        accessibilityLabel="Adicionar transação"
        onPress={() => router.push(ROUTES.MODALS.NEW_TRANSACTION)}
      />
    </ScreenContainer>
  );
}

