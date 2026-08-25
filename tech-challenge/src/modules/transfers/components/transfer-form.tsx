import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';
import MaskInput, { createNumberMask } from 'react-native-mask-input';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { cx } from '@/utils/cx';

import { CATEGORIES, TRANSACTION_TYPES } from '../constants';
import { useCreateTransfer } from '../hooks/use-create-transfer';
import type { CategoryId, TransactionType } from '../types';
import { createTransferSchema, type CreateTransferFormValues } from '../validations';

/** BRL mask: digits-only input → "R$ 1.234,56" */
const brlMask = createNumberMask({
  prefix: ['R', '$', ' '],
  delimiter: '.',
  separator: ',',
  precision: 2,
});

/** DD/MM/YYYY mask */
const dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

function todayAsDDMMYYYY(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

type TransferFormProps = {
  defaultValues?: Partial<CreateTransferFormValues>;
  onSubmit?: (values: CreateTransferFormValues) => void;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
};

export function TransferForm({
  defaultValues,
  onSubmit: externalSubmit,
  isLoading,
  isError,
  errorMessage,
}: TransferFormProps) {
  const router = useRouter();
  const createTransfer = useCreateTransfer();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTransferFormValues>({
    resolver: zodResolver(createTransferSchema),
    defaultValues: {
      description: '',
      amount: '',
      // Only default to today when creating (no defaultValues passed)
      date: defaultValues?.date ?? todayAsDDMMYYYY(),
      type: 'deposit',
      categories_id: undefined,
      receipt_url: '',
      ...defaultValues,
    },
  });

  const isInternalMode = !externalSubmit;
  const isPending = isLoading ?? (isInternalMode ? createTransfer.isPending : false);
  const hasError = isError ?? (isInternalMode ? createTransfer.isError : false);
  const errMsg =
    errorMessage ??
    (isInternalMode && createTransfer.error instanceof Error
      ? createTransfer.error.message
      : 'Não foi possível salvar a transação.');

  const onSubmit = handleSubmit((values) => {
    if (externalSubmit) {
      externalSubmit(values);
    } else {
      createTransfer.mutate(values, { onSuccess: () => router.back() });
    }
  });

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View className="gap-4 pb-6">
        {/* Description */}
        <Controller
          control={control}
          name="description"
          render={({ field }) => (
            <Input
              label="Descrição"
              placeholder="Ex.: Almoço, Uber, Aluguel..."
              error={errors.description?.message}
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        {/* Amount — BRL mask */}
        <Controller
          control={control}
          name="amount"
          render={({ field }) => (
            <View className="gap-1.5">
              <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">
                Valor (R$)
              </Text>
              <MaskInput
                mask={brlMask}
                keyboardType="numeric"
                placeholder="R$ 0,00"
                placeholderTextColor="#9AA0AC"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                className={cx(
                  'rounded-xl border bg-white px-4 py-3 text-body text-neutral-900 dark:bg-neutral-900 dark:text-white',
                  errors.amount ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700'
                )}
              />
              {errors.amount?.message ? (
                <Text className="text-small text-danger-500">{errors.amount.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Date — DD/MM/YYYY mask */}
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <View className="gap-1.5">
              <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">
                Data
              </Text>
              <MaskInput
                mask={dateMask}
                keyboardType="numeric"
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#9AA0AC"
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                className={cx(
                  'rounded-xl border bg-white px-4 py-3 text-body text-neutral-900 dark:bg-neutral-900 dark:text-white',
                  errors.date ? 'border-danger-500' : 'border-neutral-200 dark:border-neutral-700'
                )}
              />
              {errors.date?.message ? (
                <Text className="text-small text-danger-500">{errors.date.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Type */}
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <View className="gap-1.5">
              <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">
                Tipo
              </Text>
              <View className="flex-row gap-2">
                {TRANSACTION_TYPES.map((t) => (
                  <Pressable
                    key={t.value}
                    onPress={() => field.onChange(t.value as TransactionType)}
                    className={cx(
                      'flex-1 items-center rounded-xl border py-3',
                      field.value === t.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                    )}
                  >
                    <Text
                      className={cx(
                        'text-small font-medium',
                        field.value === t.value
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-300'
                      )}
                    >
                      {t.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.type?.message ? (
                <Text className="text-small text-danger-500">{errors.type.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Category */}
        <Controller
          control={control}
          name="categories_id"
          render={({ field }) => (
            <View className="gap-1.5">
              <Text className="text-small font-medium text-neutral-700 dark:text-neutral-200">
                Categoria
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <Pressable
                    key={cat.value}
                    onPress={() => field.onChange(cat.value as CategoryId)}
                    className={cx(
                      'rounded-xl border px-3 py-2',
                      field.value === cat.value
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900'
                        : 'border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900'
                    )}
                  >
                    <Text
                      className={cx(
                        'text-small font-medium',
                        field.value === cat.value
                          ? 'text-primary-600 dark:text-primary-400'
                          : 'text-neutral-600 dark:text-neutral-300'
                      )}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
              {errors.categories_id?.message ? (
                <Text className="text-small text-danger-500">{errors.categories_id.message}</Text>
              ) : null}
            </View>
          )}
        />

        {/* Receipt URL (optional) */}
        <Controller
          control={control}
          name="receipt_url"
          render={({ field }) => (
            <Input
              label="Comprovante (URL) — opcional"
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
              error={errors.receipt_url?.message}
              value={field.value ?? ''}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
            />
          )}
        />

        {hasError ? (
          <Typography variant="small" className="text-danger-500">
            {errMsg}
          </Typography>
        ) : null}

        <Button label="Salvar" onPress={onSubmit} loading={isPending} />
      </View>
    </ScrollView>
  );
}

