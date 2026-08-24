import { View } from 'react-native';

import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate } from '@/utils/format-date';

import { CATEGORIES_MAP, type Transfer } from '../types';

export function TransferListItem({ transfer }: { transfer: Transfer }) {
  const categoryLabel = transfer.categories_id ? CATEGORIES_MAP[transfer.categories_id] : undefined;

  return (
    <Card className="gap-2">
      <View className="flex-row items-center justify-between">
        <Typography variant="body">{transfer.description}</Typography>
        <Typography
          variant="subtitle"
          className={transfer.type === 'Deposit' ? 'text-success-500' : undefined}>
          {formatCurrency(transfer.amount)}
        </Typography>
      </View>
      <View className="flex-row items-center justify-between">
        <Typography variant="small">{formatDate(new Date(transfer.date))}</Typography>
        {categoryLabel ? <Badge label={categoryLabel} /> : null}
      </View>
    </Card>
  );
}
