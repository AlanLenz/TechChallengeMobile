import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthContext } from '@/contexts/auth-context';

import { TRANSACTIONS_QUERY_KEYS } from '../constants';
import {
  createTransaction,
  updateTransaction,
  uploadTransactionReceipt,
} from '../services/transactions.service';
import type { TransactionFormValues } from '../validations';

export function useCreateTransaction() {
  const { user } = useAuthContext();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TransactionFormValues) => {
      const userId = user!.uid;
      // A transação é criada primeiro para termos o id real no caminho do Storage — assim o
      // upload nunca gera arquivo órfão. Se o upload falhar, a transação persiste sem
      // comprovante e o usuário reanexa pela tela de edição.
      const id = await createTransaction(userId, input);

      if (input.receiptFile) {
        const receipt = await uploadTransactionReceipt(userId, id, input.receiptFile);
        await updateTransaction(userId, id, input, receipt, false);
      }

      return id;
    },
    // `onSettled` (não `onSuccess`): mesmo se o upload do comprovante falhar, a transação já
    // foi criada e precisa aparecer na listagem.
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.all });
    },
  });
}
