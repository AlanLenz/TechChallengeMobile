import { useCallback, useEffect, useState } from 'react';

import type { Transaction } from '../../domain/entities/transaction.entity';
import { transactionRepository } from '../../container';

type Snapshot = {
  /** Assinatura (usuário + tentativa) que produziu estes dados. */
  key: string;
  transactions: Transaction[];
  error: string | null;
};

const NO_TRANSACTIONS: Transaction[] = [];

/**
 * Assina as transações do usuário em tempo real. A fonte da verdade é o fluxo do repositório:
 * criar/editar/excluir (inclusive em outro dispositivo) chega aqui sozinho, sem refetch manual.
 * Com `userId` indefinido ou `enabled = false` (ex.: app bloqueado pela biometria) a assinatura é
 * encerrada; ao reabilitar, reassina e recebe o estado atual de imediato.
 */
export function useTransactionsStream(userId: string | undefined, enabled: boolean) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  // Incrementar reinicia a assinatura (retry após erro).
  const [attempt, setAttempt] = useState(0);

  const active = Boolean(userId) && enabled;
  const key = `${userId}:${attempt}`;

  useEffect(() => {
    if (!userId || !enabled) return;

    return transactionRepository.subscribeToTransactions(
      userId,
      (transactions) => setSnapshot({ key, transactions, error: null }),
      (error) => setSnapshot({ key, transactions: NO_TRANSACTIONS, error: String(error) })
    );
  }, [userId, enabled, key]);

  // Dados de outro usuário/tentativa nunca são expostos: só vale o snapshot da assinatura atual.
  const current = active && snapshot?.key === key ? snapshot : null;
  const resubscribe = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    transactions: current?.transactions ?? NO_TRANSACTIONS,
    isLoading: active && !current,
    error: current?.error ?? null,
    resubscribe,
  };
}
