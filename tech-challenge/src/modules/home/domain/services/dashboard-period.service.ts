import { subDays } from 'date-fns';

import type { Transaction } from '@/modules/transactions';

export type DashboardPeriod = 'this-month' | 'last-30-days' | 'all-time';

export const DASHBOARD_PERIOD_OPTIONS: {
  value: DashboardPeriod;
  label: string;
}[] = [
  { value: 'this-month', label: 'Este mês' },
  { value: 'last-30-days', label: '30 dias' },
  { value: 'all-time', label: 'Todo o período' },
];

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: DashboardPeriod,
  referenceDate = new Date()
): Transaction[] {
  if (period === 'all-time') return transactions;

  const endDate = toDateKey(referenceDate);
  const startDate =
    period === 'this-month'
      ? `${endDate.slice(0, 7)}-01`
      : toDateKey(subDays(referenceDate, 29));

  return transactions.filter((transaction) => {
    const transactionDate = transaction.date.slice(0, 10);
    return transactionDate >= startDate && transactionDate <= endDate;
  });
}
