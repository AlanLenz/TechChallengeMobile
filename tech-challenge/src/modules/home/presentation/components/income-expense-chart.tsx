import { BarChart } from 'react-native-gifted-charts';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

type IncomeExpenseChartProps = {
  totalIncome: number;
  totalExpenses: number;
};

export function IncomeExpenseChart({ totalIncome, totalExpenses }: IncomeExpenseChartProps) {
  const hasData = totalIncome > 0 || totalExpenses > 0;

  const barData = [
    {
      value: totalIncome,
      label: 'Entradas',
      frontColor: '#0d9488', // teal-600
      topLabelComponent: () => null,
    },
    {
      value: totalExpenses,
      label: 'Saídas',
      frontColor: '#ef4444', // red-500
      topLabelComponent: () => null,
    },
  ];

  return (
    <Card className="gap-3">
      <Typography variant="subtitle">Entradas × Saídas</Typography>
      {!hasData ? (
        <Typography variant="small" className="text-center py-6">
          Nenhuma transação registrada.
        </Typography>
      ) : (
        <View className="items-center">
          <BarChart
            data={barData}
            barWidth={48}
            spacing={40}
            roundedTop
            hideRules
            xAxisThickness={1}
            yAxisThickness={0}
            yAxisTextStyle={{ color: '#9aa0ac', fontSize: 11 }}
            xAxisLabelTextStyle={{ color: '#9aa0ac', fontSize: 12 }}
            noOfSections={4}
            maxValue={Math.max(totalIncome, totalExpenses) * 1.2 || 100}
            isAnimated
          />
        </View>
      )}
    </Card>
  );
}
