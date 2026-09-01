import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';

type StatCardProps = {
  label: string;
  value: string;
  accent?: 'success' | 'danger' | 'neutral';
};

function StatCard({ label, value, accent = 'neutral' }: StatCardProps) {
  const valueColor =
    accent === 'success'
      ? 'text-success-600 dark:text-success-400'
      : accent === 'danger'
        ? 'text-danger-500 dark:text-danger-400'
        : 'text-neutral-900 dark:text-white';

  return (
    <Card className="flex-1 gap-1">
      <Typography variant="small">{label}</Typography>
      <Typography variant="subtitle" className={valueColor}>
        {value}
      </Typography>
    </Card>
  );
}

type StatsGridProps = {
  totalIncome: number;
  totalExpenses: number;
  biggestExpense: number;
  transactionCount: number;
};

export function StatsGrid({
  totalIncome,
  totalExpenses,
  biggestExpense,
  transactionCount,
}: StatsGridProps) {
  return (
    <View className="gap-3">
      <View className="flex-row gap-3">
        <StatCard
          label="Entradas"
          value={formatCurrency(totalIncome)}
          accent="success"
        />
        <StatCard
          label="Saídas"
          value={formatCurrency(totalExpenses)}
          accent="danger"
        />
      </View>
      <View className="flex-row gap-3">
        <StatCard
          label="Maior Despesa"
          value={formatCurrency(biggestExpense)}
          accent="neutral"
        />
        <StatCard
          label="Transações"
          value={String(transactionCount)}
          accent="neutral"
        />
      </View>
    </View>
  );
}
