/**
 * Pré-carrega os módulos de telas e formulários de transações antecipadamente para navegação fluida.
 */
export function preloadTransactionsModule(): Promise<unknown> {
  return Promise.all([
    import('./components/transactions-screen'),
    import('./components/new-transaction-screen'),
    import('./components/edit-transaction-screen'),
  ]);
}
