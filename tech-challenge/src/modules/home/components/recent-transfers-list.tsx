import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';
import { CATEGORIES, TRANSACTION_TYPES } from '@/modules/transfers/constants';
import type { Transfer } from '@/modules/transfers';
import { formatCurrency } from '@/utils/format-currency';

type RecentTransfersListProps = {
  transfers: Transfer[];
};

export function RecentTransfersList({ transfers }: RecentTransfersListProps) {
  const router = useRouter();

  return (
    <Card className="gap-3">
      <Typography variant="subtitle">Últimas transações</Typography>

      {transfers.length === 0 ? (
        <Typography variant="small" className="text-center py-4">
          Nenhuma transação ainda.
        </Typography>
      ) : (
        <View className="gap-3">
          {transfers.map((t) => {
            const [yyyy, mm, dd] = t.date.split('-');
            const displayDate = `${dd}/${mm}/${yyyy}`;
            const typeLabel =
              TRANSACTION_TYPES.find((x) => x.value === t.type)?.label ?? t.type;
            const isIncome = t.type === 'deposit';

            return (
              <View key={t.id} className="flex-row items-start justify-between">
                <View className="flex-1 gap-0.5">
                  <Typography variant="body" className="font-medium" numberOfLines={1}>
                    {t.description}
                  </Typography>
                  <Typography variant="small">{displayDate}</Typography>
                </View>
                <View className="items-end gap-0.5">
                  <Typography variant="small">{typeLabel}</Typography>
                  <Typography
                    variant="body"
                    className={
                      isIncome
                        ? 'font-semibold text-success-600 dark:text-success-400'
                        : 'font-semibold text-danger-500 dark:text-danger-400'
                    }
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(t.amount)}
                  </Typography>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Pressable onPress={() => router.push(ROUTES.TABS.TRANSFERS)} className="items-end pt-1">
        <Typography variant="small" className="font-semibold text-teal-600 dark:text-teal-400">
          Ver mais →
        </Typography>
      </Pressable>
    </Card>
  );
}
