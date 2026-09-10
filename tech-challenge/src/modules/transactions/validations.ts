import { z } from 'zod';

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
    description: z.string().min(1, 'Informe a descrição.'),
    amount: z
      .string()
      .min(1, 'Informe o valor.')
      .refine((value) => Number(value.replace(',', '.')) > 0, 'O valor precisa ser maior que zero.'),
    date: z.string().min(1, 'Selecione a data.'),
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

export type { ReceiptFileInput };
