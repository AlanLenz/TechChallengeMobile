import { View } from 'react-native';

import { Skeleton } from '@/components/feedback/skeleton';
import { Card } from '@/components/ui/card';

export function ChartSkeleton() {
  return (
    <View className="gap-4">
      {/* Skeleton para Entradas × Saídas */}
      <Card className="gap-3 p-4">
        <Skeleton className="h-5 w-36 rounded-md" />
        <View className="h-44 w-full items-center justify-center pt-2">
          <View className="h-36 w-full flex-row items-end justify-center gap-10 px-6">
            <Skeleton className="h-28 w-12 rounded-t-lg" />
            <Skeleton className="h-20 w-12 rounded-t-lg" />
          </View>
        </View>
      </Card>

      {/* Skeleton para Gastos por Categoria */}
      <Card className="gap-4 p-4">
        <Skeleton className="h-5 w-44 rounded-md" />
        <View className="h-44 w-full items-center justify-center">
          <Skeleton className="h-36 w-36 rounded-full" />
        </View>
        <View className="flex-row flex-wrap gap-2 pt-2">
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-24 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </View>
      </Card>
    </View>
  );
}
