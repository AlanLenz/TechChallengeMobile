import { useRouter } from 'expo-router';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';

import { useCreateTransaction } from '../hooks/use-create-transaction';
import type { TransactionFormValues } from '../../domain/entities/transaction.validation';
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
      <Header title="Nova transação" onBack={() => router.back()} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
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
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

