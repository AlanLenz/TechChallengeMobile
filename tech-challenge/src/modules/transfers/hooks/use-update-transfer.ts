import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSFERS_QUERY_KEYS } from '../constants';
import { updateTransfer } from '../services/transfers.service';
import type { UpdateTransferFormValues } from '../validations';

export function useUpdateTransfer() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTransferFormValues }) =>
      updateTransfer(user!.uid, id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSFERS_QUERY_KEYS.all });
    },
  });
}
