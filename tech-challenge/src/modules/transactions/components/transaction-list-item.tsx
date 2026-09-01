import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';
import { colors } from '@/theme';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate } from '@/utils/format-date';

import { CATEGORIES_MAP, type Transaction } from '../types';

export function TransactionListItem({ transaction }: { transaction: Transaction }) {
  const router = useRouter();
  const categoryLabel = transaction.categories_id ? CATEGORIES_MAP[transaction.categories_id] : undefined;
  const isDeposit = transaction.type === 'Deposit';

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: ROUTES.MODALS.EDIT_TRANSACTION, params: { id: transaction.id } })}>
      <Card className="gap-2">
        <View className="flex-row items-center justify-between gap-2">
          <Typography variant="body" className="flex-1" numberOfLines={1}>
            {transaction.description}
          </Typography>
          <Typography variant="subtitle" className={isDeposit ? 'text-success-500' : undefined}>
            {isDeposit ? '+' : '-'}
            {formatCurrency(transaction.amount)}
          </Typography>
        </View>
        <View className="flex-row items-center justify-between gap-2">
          <View className="flex-row items-center gap-2">
            <Typography variant="small">{formatDate(new Date(transaction.date))}</Typography>
            <Badge label={isDeposit ? 'Depósito' : 'Transferência'} tone={isDeposit ? 'success' : 'neutral'} />
          </View>
          <View className="flex-row items-center gap-2">
            {transaction.receipt_url ? (
              <Ionicons name="attach-outline" size={16} color={colors.neutral[400]} />
            ) : null}
            {categoryLabel ? <Badge label={categoryLabel} /> : null}
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
