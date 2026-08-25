import { Pressable } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';

import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import type { Transfer } from '../types';

type TransferListItemProps = {
  transfer: Transfer;
  onPress?: (transfer: Transfer) => void;
};

export function TransferListItem({ transfer, onPress }: TransferListItemProps) {
  const categoryLabel =
    CATEGORIES.find((c) => c.value === transfer.categories_id)?.label ?? '—';
  const typeLabel =
    TRANSACTION_TYPES.find((t) => t.value === transfer.type)?.label ?? transfer.type;

  return (
    <Pressable onPress={() => onPress?.(transfer)}>
      <Card className="gap-1">
        <Typography variant="body" className="font-medium">
          {transfer.description}
        </Typography>
        <Typography variant="small" className="text-neutral-500">
          {categoryLabel} · {typeLabel} · {transfer.date}
        </Typography>
        <Typography
          variant="body"
          className={
            transfer.type === 'deposit' ? 'text-success-500' : 'text-danger-500'
          }
        >
          {transfer.type === 'deposit' ? '+' : '-'} {formatCurrency(transfer.amount)}
        </Typography>
      </Card>
    </Pressable>
  );
}

