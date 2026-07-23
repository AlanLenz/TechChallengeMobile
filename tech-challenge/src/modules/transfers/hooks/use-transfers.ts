import { useQuery } from '@tanstack/react-query';

import { TRANSFERS_QUERY_KEYS } from '../constants';
import { getTransfers } from '../services/transfers.service';

export function useTransfers(accountId?: string) {
  return useQuery({
    queryKey: TRANSFERS_QUERY_KEYS.list(accountId),
    queryFn: () => getTransfers(accountId!),
    enabled: Boolean(accountId),
  });
}
