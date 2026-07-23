import { z } from 'zod';

export const emailSchema = z.string().min(1, 'E-mail é obrigatório.').email('E-mail inválido.');

export const passwordSchema = z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.');

export const cpfSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length === 11, 'CPF deve ter 11 dígitos.');

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length >= 10 && value.length <= 11, 'Telefone inválido.');

export const currencySchema = z.coerce.number().positive('O valor precisa ser maior que zero.');
