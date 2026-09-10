import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';

import { useCreateTransaction } from '../hooks/use-create-transaction';
import type { TransactionFormValues } from '../validations';
import { TransactionForm } from './transaction-form';

export function NewTransactionScreen() {
  const router = useRouter();
  const createTransaction = useCreateTransaction();

  const handleSubmit = async (values: TransactionFormValues) => {
    await createTransaction.mutateAsync(values);
    router.back();
  };

  return (
    <ScreenContainer edges={['top']} className="gap-6 px-0">
      <View className="py-3 bg-primary-500">
        <Header title="Nova transação" onBack={() => router.back()} />
      </View>
      <View className="flex-1 px-screen-x">
        <TransactionForm
          submitLabel="Adicionar transação"
          isSubmitting={createTransaction.isPending}
          submitError={
            createTransaction.isError
              ? createTransaction.error instanceof Error
                ? createTransaction.error.message
                : 'Não foi possível salvar a transação.'
              : undefined
          }
          onSubmit={handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}
