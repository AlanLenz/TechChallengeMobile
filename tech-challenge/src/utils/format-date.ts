import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function formatDate(date: Date | number, pattern = 'dd/MM/yyyy'): string {
  return format(date, pattern, { locale: ptBR });
}

export function formatRelativeDate(date: Date | number): string {
  return formatDistanceToNow(date, { locale: ptBR, addSuffix: true });
}
