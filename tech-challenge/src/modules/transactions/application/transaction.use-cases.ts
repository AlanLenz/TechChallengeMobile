import type { TransactionReceipt } from '../domain/entities/transaction.entity';
import type { TransactionFormValues } from '../domain/entities/transaction.validation';
import type { ITransactionRepository } from '../domain/repositories/transaction.repository';

/** Cria a transação e, se houver comprovante novo, envia o arquivo e o vincula ao documento. */
export async function createTransactionWithReceipt(
  repository: ITransactionRepository,
  userId: string,
  input: TransactionFormValues
): Promise<string> {
  const id = await repository.createTransaction(userId, input);

  if (input.receiptFile) {
    const receipt = await repository.uploadTransactionReceipt(userId, id, input.receiptFile);
    await repository.updateTransaction(userId, id, input, receipt, false);
  }

  return id;
}

/**
 * Atualiza a transação, enviando o comprovante novo (se houver) e removendo do Storage o
 * comprovante anterior quando ele foi substituído ou excluído.
 */
export async function updateTransactionWithReceipt(
  repository: ITransactionRepository,
  userId: string,
  id: string,
  input: TransactionFormValues,
  previousReceipt?: TransactionReceipt
): Promise<void> {
  const receipt = input.receiptFile
    ? await repository.uploadTransactionReceipt(userId, id, input.receiptFile)
    : input.receipt;

  await repository.updateTransaction(userId, id, input, receipt, Boolean(previousReceipt));

  if (previousReceipt && previousReceipt.path !== receipt?.path) {
    await repository.deleteTransactionReceipt(previousReceipt.path);
  }
}
