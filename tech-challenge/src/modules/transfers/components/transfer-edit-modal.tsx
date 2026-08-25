import { useState } from 'react';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Typography } from '@/components/ui/typography';

import { useDeleteTransfer } from '../hooks/use-delete-transfer';
import { useUpdateTransfer } from '../hooks/use-update-transfer';
import type { Transfer } from '../types';
import type { CreateTransferFormValues } from '../validations';
import { TransferForm } from './transfer-form';

type TransferEditModalProps = {
  transfer: Transfer | null;
  onClose: () => void;
};

export function TransferEditModal({ transfer, onClose }: TransferEditModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const updateTransfer = useUpdateTransfer();
  const deleteTransfer = useDeleteTransfer();

  if (!transfer) return null;

  /** "YYYY-MM-DD" → "DD/MM/YYYY" for the masked input */
  function toDisplayDate(iso: string): string {
    const [yyyy, mm, dd] = iso.split('-');
    return `${dd}/${mm}/${yyyy}`;
  }

  /** 1234.56 → "R$ 1.234,56" so MaskInput shows it pre-filled */
  function toDisplayAmount(value: number): string {
    const cents = Math.round(value * 100);
    const formatted = (cents / 100).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return `R$ ${formatted}`;
  }

  const defaultValues: Partial<CreateTransferFormValues> = {
    description: transfer.description,
    amount: toDisplayAmount(transfer.amount),
    date: toDisplayDate(transfer.date),
    type: transfer.type,
    categories_id: transfer.categories_id,
    receipt_url: transfer.receipt_url ?? '',
  };

  function handleUpdate(values: CreateTransferFormValues) {
    updateTransfer.mutate(
      { id: transfer!.id, input: values },
      { onSuccess: onClose }
    );
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteTransfer.mutate(transfer!.id, { onSuccess: onClose });
  }

  return (
    <Modal visible={Boolean(transfer)} onRequestClose={onClose} className="max-h-[90%]">
      <View className="gap-4">
        <Typography variant="heading" className="text-lg">
          Editar Transação
        </Typography>

        <TransferForm
          defaultValues={defaultValues}
          onSubmit={handleUpdate}
          isLoading={updateTransfer.isPending}
          isError={updateTransfer.isError}
          errorMessage={
            updateTransfer.error instanceof Error
              ? updateTransfer.error.message
              : undefined
          }
        />

        {/* Delete section */}
        {confirmDelete ? (
          <View className="gap-2">
            <Typography variant="small" className="text-center text-danger-500">
              Tem certeza? Esta ação não pode ser desfeita.
            </Typography>
            <View className="flex-row gap-2">
              <Button
                label="Cancelar"
                variant="ghost"
                className="flex-1"
                onPress={() => setConfirmDelete(false)}
              />
              <Button
                label="Confirmar exclusão"
                className="flex-1 bg-danger-500"
                loading={deleteTransfer.isPending}
                onPress={handleDelete}
              />
            </View>
          </View>
        ) : (
          <Button
            label="Excluir transação"
            variant="ghost"
            className="border border-danger-500"
            onPress={handleDelete}
          />
        )}
      </View>
    </Modal>
  );
}
