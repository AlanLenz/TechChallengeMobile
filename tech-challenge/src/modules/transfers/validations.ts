import { z } from 'zod';

export const transferFormSchema = z
  .object({
    type: z.enum(['Deposit', 'Transfer'], { message: 'Selecione o tipo.' }),
    description: z.string().min(1, 'Informe a descrição.'),
    amount: z
      .string()
      .min(1, 'Informe o valor.')
      .refine((value) => Number(value.replace(',', '.')) > 0, 'O valor precisa ser maior que zero.'),
    date: z.string().min(1, 'Selecione a data.'),
    categoriesId: z.number().int().min(1).max(7).optional(),
    receiptUri: z.string().optional(),
    receiptUrl: z.string().optional(),
  })
  .refine((data) => data.categoriesId !== undefined, {
    message: 'Selecione a categoria.',
    path: ['categoriesId'],
  });

export type TransferFormValues = z.infer<typeof transferFormSchema>;
