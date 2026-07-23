import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';
import { formatDate } from '@/utils/format-date';

import type { Transfer } from '../types';

export function TransferListItem({ transfer }: { transfer: Transfer }) {
  return (
    <Card className="flex-row items-center justify-between">
      <Typography variant="small">{formatDate(transfer.createdAt)}</Typography>
      <Typography variant="body">{formatCurrency(transfer.amount)}</Typography>
    </Card>
  );
}
