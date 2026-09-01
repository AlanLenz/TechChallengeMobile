import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';
import { CATEGORY_OPTIONS, TRANSACTION_TYPE_OPTIONS, type Transaction } from '@/modules/transactions';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate } from '@/utils/format-date';

type RecentTransactionsListProps = {
  transactions: Transaction[];
};

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps) {
  const router = useRouter();

  return (
    <Card className="gap-3">
      <Typography variant="subtitle">Últimas transações</Typography>

      {transactions.length === 0 ? (
        <Typography variant="small" className="text-center py-4">
          Nenhuma transação ainda.
        </Typography>
      ) : (
        <View className="gap-3">
          {transactions.map((t) => {
            const typeLabel = TRANSACTION_TYPE_OPTIONS.find((x) => x.value === t.type)?.label ?? t.type;
            const categoryLabel = t.categories_id
              ? CATEGORY_OPTIONS.find((c) => c.value === t.categories_id)?.label
              : undefined;
            const isIncome = t.type === 'Deposit';

            return (
              <View key={t.id} className="flex-row items-start justify-between">
                <View className="flex-1 gap-0.5">
                  <Typography variant="body" className="font-medium" numberOfLines={1}>
                    {t.description}
                  </Typography>
                  <Typography variant="small">
                    {formatDate(new Date(t.date))}
                    {categoryLabel ? ` · ${categoryLabel}` : ''}
                  </Typography>
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

      <Pressable onPress={() => router.push(ROUTES.TABS.TRANSACTIONS)} className="items-end pt-1">
        <Typography variant="small" className="font-semibold text-teal-600 dark:text-teal-400">
          Ver mais →
        </Typography>
      </Pressable>
    </Card>
  );
}
