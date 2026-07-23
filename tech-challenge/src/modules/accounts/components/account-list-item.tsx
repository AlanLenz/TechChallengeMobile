import { Pressable } from 'react-native';

import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { formatCurrency } from '@/utils/format-currency';

import type { Account } from '../types';

type AccountListItemProps = {
  account: Account;
  onPress?: () => void;
};

export function AccountListItem({ account, onPress }: AccountListItemProps) {
  return (
    <Pressable onPress={onPress}>
      <Card className="flex-row items-center justify-between">
        <Typography variant="body">{account.label}</Typography>
        <Typography variant="subtitle">{formatCurrency(account.balance)}</Typography>
      </Card>
    </Pressable>
  );
}
