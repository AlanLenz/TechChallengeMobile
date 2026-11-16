import { preloadImages } from '@/services/preload.service';

import type { Transaction } from './domain/entities/transaction.entity';

/**
 * Pré-carrega os módulos de telas e formulários de transações antecipadamente para navegação fluida.
 */
export function preloadTransactionsModule(): Promise<unknown> {
  return Promise.all([
    import('./presentation/components/transactions-screen'),
    import('./presentation/components/new-transaction-screen'),
    import('./presentation/components/edit-transaction-screen'),
  ]);
}

/**
 * Pré-carrega em lote as imagens de comprovantes anexados no cache nativo do dispositivo.
 */
export function preloadTransactionReceipts(transactions: Transaction[]): Promise<boolean[]> {
  const urls = transactions
    .filter((transaction) => transaction.receipt?.contentType.startsWith('image/'))
    .map((transaction) => transaction.receipt?.url)
    .filter((url): url is string => Boolean(url));
  return preloadImages(urls);
}
