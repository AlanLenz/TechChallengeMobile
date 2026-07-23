import { z } from 'zod';

export const createTransferSchema = z.object({
  fromAccountId: z.string().min(1, 'Selecione a conta de origem.'),
  toAccountId: z.string().min(1, 'Informe a conta de destino.'),
  amount: z
    .string()
    .min(1, 'Informe o valor.')
    .refine((value) => Number(value.replace(',', '.')) > 0, 'O valor precisa ser maior que zero.'),
});

export type CreateTransferFormValues = z.infer<typeof createTransferSchema>;
