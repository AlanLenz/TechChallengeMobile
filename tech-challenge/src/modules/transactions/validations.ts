import { z } from 'zod';

import { parseCurrencyToNumber } from '@/utils/mask';
import { RECEIPT_MAX_SIZE_BYTES } from './constants';
import type { TransactionReceipt } from './types';
import { isAllowedReceiptType, type ReceiptFileInput } from './utils';

/** Arquivo recém-selecionado no picker, ainda não enviado ao Storage. */
const receiptFileSchema = z
  .object({
    uri: z.string().min(1),
    name: z.string().min(1),
    size: z.number().optional(),
    mimeType: z.string().optional(),
  })
  .refine((file) => isAllowedReceiptType(file), {
    message: 'Formato não suportado. Envie JPG, PNG, WEBP ou PDF.',
  })
  .refine((file) => file.size === undefined || file.size > 0, {
    message: 'O arquivo está vazio.',
  })
  .refine((file) => file.size === undefined || file.size <= RECEIPT_MAX_SIZE_BYTES, {
    message: 'Arquivo muito grande. O tamanho máximo é 5 MB.',
  });

export const transactionFormSchema = z
  .object({
    type: z.enum(['Deposit', 'Transfer'], { message: 'Selecione o tipo.' }),
    description: z
      .string({ message: 'Informe a descrição.' })
      .trim()
      .min(3, 'A descrição deve ter pelo menos 3 caracteres.')
      .max(100, 'A descrição deve ter no máximo 100 caracteres.'),
    amount: z
      .string({ message: 'Informe o valor.' })
      .min(1, 'Informe o valor.')
      .refine((val) => parseCurrencyToNumber(val) > 0, 'O valor precisa ser maior que R$ 0,00.')
      .refine(
        (val) => parseCurrencyToNumber(val) <= 999_999_999.99,
        'O valor máximo permitido é R$ 999.999.999,99.'
      ),
    date: z
      .string({ message: 'Selecione a data.' })
      .min(1, 'Selecione a data.')
      .refine((val) => {
        const date = new Date(val);
        return !Number.isNaN(date.getTime());
      }, 'Data inválida.')
      .refine((val) => {
        const date = new Date(val);
        const endOfToday = new Date();
        endOfToday.setHours(23, 59, 59, 999);
        return date <= endOfToday;
      }, 'A data não pode ser futura.')
      .refine((val) => {
        const date = new Date(val);
        const minPast = new Date();
        minPast.setFullYear(minPast.getFullYear() - 10);
        return date >= minPast;
      }, 'A data não pode ser anterior a 10 anos atrás.'),
    categoriesId: z.number().int().min(1).max(7).optional(),
    /** Novo arquivo a enviar (opcional — comprovante não é obrigatório). */
    receiptFile: receiptFileSchema.optional(),
    /** Comprovante já enviado (preenchido só na edição). */
    receipt: z.custom<TransactionReceipt>().optional(),
  })
  .refine((data) => data.categoriesId !== undefined, {
    message: 'Selecione a categoria.',
    path: ['categoriesId'],
  });

export type TransactionFormValues = z.infer<typeof transactionFormSchema>;

export function validateDateRange(startDate?: string, endDate?: string): string | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Data inválida.';
  }
  if (start > end) {
    return 'A data inicial não pode ser posterior à data final.';
  }
  return null;
}

export type { ReceiptFileInput };
