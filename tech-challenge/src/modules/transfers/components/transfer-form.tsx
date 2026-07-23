import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';

import { useCreateTransfer } from '../hooks/use-create-transfer';
import { createTransferSchema, type CreateTransferFormValues } from '../validations';

export function TransferForm() {
  const router = useRouter();
  const createTransfer = useCreateTransfer();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTransferFormValues>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: { fromAccountId: '', toAccountId: '', amount: '' },
  });

  const onSubmit = handleSubmit((values) => {
    createTransfer.mutate(values, { onSuccess: () => router.back() });
  });

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="fromAccountId"
        render={({ field }) => (
          <Input
            label="Conta de origem"
            error={errors.fromAccountId?.message}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      <Controller
        control={control}
        name="toAccountId"
        render={({ field }) => (
          <Input
            label="Conta de destino"
            error={errors.toAccountId?.message}
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
            keyboardType="decimal-pad"
            error={errors.amount?.message}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {createTransfer.isError ? (
        <Typography variant="small" className="text-danger-500">
          {createTransfer.error instanceof Error
            ? createTransfer.error.message
            : 'Não foi possível transferir.'}
        </Typography>
      ) : null}
      <Button label="Transferir" onPress={onSubmit} loading={createTransfer.isPending} />
    </View>
  );
}
