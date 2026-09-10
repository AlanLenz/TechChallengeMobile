export function maskCpf(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function maskPhone(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d{4})$/, '$1-$2');
}

export function maskDate(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 8)
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d{1,4})$/, '$1/$2');
}

export function maskCurrency(value: string | number): string {
  if (typeof value === 'number') {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    })
      .format(value)
      .replace(/\u00A0/g, ' ');
  }

  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (!digits) return '';

  const num = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
    .format(num)
    .replace(/\u00A0/g, ' ');
}

export function parseCurrencyToNumber(value: string | number): number {
  if (typeof value === 'number') return Number.isNaN(value) ? 0 : value;
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (!digits) return 0;
  return Number(digits) / 100;
}

