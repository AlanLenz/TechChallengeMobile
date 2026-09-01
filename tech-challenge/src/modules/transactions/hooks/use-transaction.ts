import { useQuery } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import { getTransaction } from '../services/transactions.service';

/** Busca uma transação por id — usado pela tela de edição, que pode ser aberta diretamente
 * (sem depender do cache da listagem já estar populado). */
export function useTransaction(id?: string) {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEYS.detail(id ?? ''),
    queryFn: () => getTransaction(user!.uid, id!),
    enabled: Boolean(user) && Boolean(id),
  });
}
