import { useQuery } from '@tanstack/react-query';

import { ACCOUNTS_QUERY_KEYS } from '../constants';
import { getAccountById } from '../services/accounts.service';

export function useAccount(id: string) {
  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.detail(id),
    queryFn: () => getAccountById(id),
  });
}
