import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSFERS_QUERY_KEYS } from '../constants';
import { deleteTransfer } from '../services/transfers.service';

export function useDeleteTransfer() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transferId: string) => deleteTransfer(user!.uid, transferId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEYS.all });
    },
  });
}
