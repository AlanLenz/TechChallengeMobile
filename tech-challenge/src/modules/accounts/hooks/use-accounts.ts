import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { ACCOUNTS_QUERY_KEYS } from '../constants';
import { getAccounts } from '../services/accounts.service';

export function useAccounts() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: ACCOUNTS_QUERY_KEYS.list(user?.uid),
    queryFn: () => getAccounts(user!.uid),
    enabled: Boolean(user),
  });
}
