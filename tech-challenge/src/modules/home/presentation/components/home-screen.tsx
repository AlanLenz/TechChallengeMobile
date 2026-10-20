import { Suspense, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { ScrollView } from 'react-native';

import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { ScreenContainer } from '@/components/layout/screen-container';
import { FloatingActionButton } from '@/components/ui/fab';
import { ROUTES } from '@/constants/routes';
import { useAuthContext } from '@/contexts/auth-context';
import { preloadTransactionsModule } from '@/modules/transactions';
import { lazyWithPreload } from '@/utils/lazy-with-preload';

import { useHomeDashboard } from '../hooks/use-home-dashboard';
import { AnimatedHeroCard } from './animated-hero-card';
import { ChartSkeleton } from './chart-skeleton';
import { RecentTransactionsList } from './recent-transactions-list';
import { StatsGrid } from './stats-grid';

export const DashboardCharts = lazyWithPreload(() =>
  import('./dashboard-charts').then((m) => ({ default: m.DashboardCharts }))
);

export function preloadHomeCharts(): Promise<unknown> {
  return DashboardCharts.preload();
}

// Inicia o pré-carregamento imediato no momento em que o módulo da Home é importado,
// garantindo que o bundle do gráfico seja compilado e mantido em cache antes da navegação.
void preloadHomeCharts();

export function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const { data: stats, isPending, isError } = useHomeDashboard();

  const firstName = (user?.displayName ?? user?.email ?? 'Usuário').split(' ')[0];

  useEffect(() => {
    // Garante que o pré-carregamento foi disparado
    void preloadHomeCharts();
  }, []);

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
        <AnimatedHeroCard
          firstName={firstName}
          balance={stats.totalBalance}
        />
        <StatsGrid
          totalIncome={stats.totalIncome}
          totalExpenses={stats.totalExpenses}
          biggestExpense={stats.biggestExpense}
          transactionCount={stats.transactionCount}
        />

        <Suspense fallback={<ChartSkeleton />}>
          <DashboardCharts
            totalIncome={stats.totalIncome}
            totalExpenses={stats.totalExpenses}
            categoryBreakdown={stats.categoryBreakdown}
          />
        </Suspense>

        <RecentTransactionsList transactions={stats.recentTransactions} />
      </ScrollView>
      <FloatingActionButton
        accessibilityLabel="Adicionar transação"
        onPressIn={() => {
          void preloadTransactionsModule();
        }}
        onPress={() => router.push(ROUTES.MODALS.NEW_TRANSACTION)}
      />
    </ScreenContainer>
  );
}
