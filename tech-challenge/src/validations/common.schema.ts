import { z } from 'zod';

export const emailSchema = z
  .string()
  .min(1, 'E-mail é obrigatório.')
  .trim()
  .toLowerCase()
  .email('E-mail inválido.');

export const passwordSchema = z
  .string()
  .min(8, 'A senha precisa ter pelo menos 8 caracteres.')
  .regex(/[a-z]/, 'A senha deve conter pelo menos uma letra minúscula.')
  .regex(/[A-Z]/, 'A senha deve conter pelo menos uma letra maiúscula.')
  .regex(/[0-9]/, 'A senha deve conter pelo menos um número.');

export const loginPasswordSchema = z
  .string()
  .min(1, 'A senha é obrigatória.');

export const cpfSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length === 11, 'CPF deve ter 11 dígitos.');

export const phoneSchema = z
  .string()
  .transform((value) => value.replace(/\D/g, ''))
  .refine((value) => value.length >= 10 && value.length <= 11, 'Telefone inválido.');

export const currencySchema = z.coerce.number().positive('O valor precisa ser maior que zero.');
