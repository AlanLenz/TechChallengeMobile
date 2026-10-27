import { View } from 'react-native';

import type { CategoryBreakdownItem } from '@/modules/transactions';

import { CategoryChart } from './category-chart';
import { IncomeExpenseChart } from './income-expense-chart';

type DashboardChartsProps = {
  totalIncome: number;
  totalExpenses: number;
  categoryBreakdown: CategoryBreakdownItem[];
};

export function DashboardCharts({
  totalIncome,
  totalExpenses,
  categoryBreakdown,
}: DashboardChartsProps) {
  return (
    <View className="gap-4">
      <IncomeExpenseChart
        totalIncome={totalIncome}
        totalExpenses={totalExpenses}
      />
      <CategoryChart data={categoryBreakdown} />
    </View>
  );
}
