import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSFERS_QUERY_KEYS } from '../constants';
import { createTransfer } from '../services/transfers.service';
import type { TransferFormValues } from '../validations';

export function useCreateTransfer() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: TransferFormValues) => createTransfer(user!.uid, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEYS.all });
    },
  });
}
