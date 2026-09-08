import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import { getTransactions } from '../services/transactions.service';

export function useTransactions() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.list(user?.uid),
    queryFn: () => getTransactions(user!.uid),
    enabled: Boolean(user),
  });
}
