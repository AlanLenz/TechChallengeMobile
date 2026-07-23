import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { HOME_QUERY_KEYS } from '../constants';
import { getAccountsSummary } from '../services/home.service';

export function useDashboardSummary() {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: HOME_QUERY_KEYS.list(user?.uid),
    queryFn: () => getAccountsSummary(user!.uid),
    enabled: Boolean(user),
  });
}
