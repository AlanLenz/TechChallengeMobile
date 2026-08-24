import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSFERS_QUERY_KEYS } from '../constants';
import { getTransfers } from '../services/transfers.service';

export function useTransfers() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: TRANSFERS_QUERY_KEYS.list(user?.uid),
    queryFn: () => getTransfers(user!.uid),
    enabled: Boolean(user),
  });
}
