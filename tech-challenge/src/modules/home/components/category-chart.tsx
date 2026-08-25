import { PieChart } from 'react-native-gifted-charts';
import { View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';

// Fixed palette aligned to the 7 categories
const PALETTE = ['#0d9488', '#14b8a6', '#2dd4bf', '#5eead4', '#99f6e4', '#f97316', '#a855f7'];

type CategoryBreakdown = {
  categoryId: number;
  label: string;
  total: number;
};

type CategoryChartProps = {
  data: CategoryBreakdown[];
};

export function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <Card className="gap-3">
        <Typography variant="subtitle">Gastos por Categoria</Typography>
        <Typography variant="small" className="text-center py-6">
          Nenhuma despesa registrada.
        </Typography>
      </Card>
    );
  }

  const total = data.reduce((s, d) => s + d.total, 0);

  const pieData = data.map((item, i) => ({
    value: item.total,
    color: PALETTE[i % PALETTE.length],
    text: `${Math.round((item.total / total) * 100)}%`,
  }));

  return (
    <Card className="gap-4">
      <Typography variant="subtitle">Gastos por Categoria</Typography>

      <View className="items-center">
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={54}
          showText
          textColor="#fff"
          textSize={11}
          fontWeight="600"
          isAnimated
        />
      </View>

      {/* Legend */}
      <View className="flex-row flex-wrap gap-x-4 gap-y-2">
        {data.map((item, i) => (
          <View key={item.categoryId} className="flex-row items-center gap-1.5">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
            />
            <Typography variant="small">{item.label}</Typography>
          </View>
        ))}
      </View>
    </Card>
  );
}
