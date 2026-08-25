import { z } from 'zod';

import { CATEGORIES, TRANSACTION_TYPES } from './constants';

const categoryValues = CATEGORIES.map((c) => c.value) as [number, ...number[]];
const typeValues = TRANSACTION_TYPES.map((t) => t.value) as [string, ...string[]];

export const transferSchema = z.object({
  description: z.string().min(1, 'Informe uma descrição.'),
  // Stored as the raw masked string, e.g. "R$ 1.234,56" — parsed before saving
  amount: z
    .string()
    .min(1, 'Informe o valor.')
    .refine((v) => {
      const digits = v.replace(/\D/g, '');
      return digits.length > 0 && Number(digits) > 0;
    }, 'O valor precisa ser maior que zero.'),
  // Display format: DD/MM/YYYY — converted to YYYY-MM-DD before saving
  date: z
    .string()
    .min(10, 'Informe a data completa.')
    .regex(/^\d{2}\/\d{2}\/\d{4}$/, 'Data inválida (use DD/MM/AAAA).')
    .refine((v) => {
      const [dd, mm, yyyy] = v.split('/').map(Number);
      const d = new Date(yyyy, mm - 1, dd);
      return d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd;
    }, 'Data inválida.'),
  type: z.enum(typeValues as [string, ...string[]], { message: 'Selecione o tipo.' }),
  categories_id: z.number({ message: 'Selecione uma categoria.' }).refine(
    (v) => categoryValues.includes(v),
    'Categoria inválida.'
  ),
  receipt_url: z.string().url('URL inválida.').or(z.literal('')).optional(),
});

export const createTransferSchema = transferSchema;
export const updateTransferSchema = transferSchema.partial();

export type TransferFormValues = z.infer<typeof transferSchema>;
export type CreateTransferFormValues = z.infer<typeof createTransferSchema>;
export type UpdateTransferFormValues = z.infer<typeof updateTransferSchema>;
