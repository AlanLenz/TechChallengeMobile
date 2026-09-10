import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Typography } from '@/components/ui/typography';

import { CATEGORY_OPTIONS, TRANSACTION_TYPE_OPTIONS } from '../constants';
import type { CategoryId } from '../types';
import { transactionFormSchema, type TransactionFormValues } from '../validations';
import { ReceiptField } from './receipt-field';

type TransactionFormProps = {
  initialValues?: Partial<TransactionFormValues>;
  onSubmit: (values: TransactionFormValues) => void | Promise<void>;
  submitLabel: string;
  isSubmitting?: boolean;
  submitError?: string;
  /** Só telas de edição passam isso — quando ausente, o botão de excluir nem aparece. */
  onDelete?: () => void | Promise<void>;
  isDeleting?: boolean;
};

export function TransactionForm({
  initialValues,
  onSubmit,
  submitLabel,
  isSubmitting,
  submitError,
  onDelete,
  isDeleting,
}: TransactionFormProps) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionFormSchema),
    defaultValues: {
      type: 'Transfer',
      description: '',
      amount: '',
      date: '',
      categoriesId: undefined,
      receiptFile: undefined,
      receipt: undefined,
      ...initialValues,
    },
  });

  const receiptFile = watch('receiptFile');
  const receipt = watch('receipt');

  const submit = handleSubmit((values) => onSubmit(values));

  return (
    <View className="flex flex-1 flex-col justify-between gap-6 pb-8">
      <View className="gap-4">
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select
              label="Tipo"
              options={TRANSACTION_TYPE_OPTIONS}
              value={field.value}
              onChange={field.onChange}
              error={errors.type?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Input
              label="Descrição"
              placeholder="Ex.: Almoço, Uber, aluguel..."
              error={errors.description?.message}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <Input
              label="Valor"
              placeholder="0,00"
              keyboardType="decimal-pad"
              error={errors.amount?.message}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DateField
              label="Data"
              value={field.value}
              onChange={field.onChange}
              error={errors.date?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="categoriesId"
          render={({ field }) => (
            <Select
              label="Categoria"
              placeholder="Selecione a categoria"
              options={CATEGORY_OPTIONS}
              value={field.value as CategoryId | undefined}
              onChange={field.onChange}
              error={errors.categoriesId?.message}
            />
          )}
        />

        <ReceiptField
          receiptFile={receiptFile}
          receipt={receipt}
          onPickFile={(file) => setValue('receiptFile', file, { shouldDirty: true, shouldValidate: true })}
          onRemove={() => {
            setValue('receiptFile', undefined, { shouldDirty: true });
            setValue('receipt', undefined, { shouldDirty: true });
          }}
          error={errors.receiptFile?.message}
          isUploading={Boolean(isSubmitting && receiptFile)}
          disabled={isSubmitting}
        />
      </View>
      {submitError ? (
        <Typography variant="small" className="text-danger-500">
          {submitError}
        </Typography>
      ) : null}

      <View className="gap-3">
        <Button label={submitLabel} onPress={submit} loading={isSubmitting} />
        {onDelete ? (
          <Button
            label="Excluir transação"
            variant="danger"
            onPress={() => setConfirmDeleteOpen(true)}
            disabled={isSubmitting}
          />
        ) : null}
      </View>

      {onDelete ? (
        <Modal visible={confirmDeleteOpen} onRequestClose={() => setConfirmDeleteOpen(false)} className="gap-4">
          <Typography variant="subtitle">Excluir transação?</Typography>
          <Typography variant="small">Essa ação não pode ser desfeita.</Typography>
          <View className="flex-row gap-3">
            <Button
              label="Cancelar"
              variant="secondary"
              className="flex-1"
              onPress={() => setConfirmDeleteOpen(false)}
              disabled={isDeleting}
            />
            <Button
              label="Excluir"
              variant="danger"
              className="flex-1"
              loading={isDeleting}
              onPress={onDelete}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}
