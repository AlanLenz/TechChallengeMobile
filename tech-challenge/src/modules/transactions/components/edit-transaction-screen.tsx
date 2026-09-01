import { useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { EmptyState } from '@/components/feedback/empty-state';
import { Loading } from '@/components/feedback/loading';
import { useAuthContext } from '@/contexts/auth-context';
import { getFileUrl, uploadFile } from '@/firebase/storage';

import { useDeleteTransaction } from '../hooks/use-delete-transaction';
import { useTransaction } from '../hooks/use-transaction';
import { useUpdateTransaction } from '../hooks/use-update-transaction';
import type { TransactionFormValues } from '../validations';
import { TransactionForm } from './transaction-form';

export function EditTransactionScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthContext();
  const { data: transaction, isLoading } = useTransaction(id);
  const updateTransaction = useUpdateTransaction();
  const deleteTransaction = useDeleteTransaction();

  const handleSubmit = async (values: TransactionFormValues) => {
    let receiptUrl = values.receiptUrl;

    if (values.receiptUri) {
      const path = `users/${user!.uid}/transactions/${Date.now()}-receipt.jpg`;
      const blob = await (await fetch(values.receiptUri)).blob();
      await uploadFile(path, blob);
      receiptUrl = await getFileUrl(path);
    }

    await updateTransaction.mutateAsync({ id, input: { ...values, receiptUrl } });
    router.back();
  };

  const handleDelete = async () => {
    await deleteTransaction.mutateAsync(id);
    router.back();
  };

  return (
    <ScreenContainer edges={['top']} className="gap-6 px-0">
      <View className="py-3 bg-primary-500">
        <Header title="Editar transação" onBack={() => router.back()} />
      </View>
      {isLoading ? (
        <Loading />
      ) : !transaction ? (
        <EmptyState
          icon="alert-circle-outline"
          title="Transação não encontrada"
          description="Ela pode ter sido excluída ou o link está incorreto."
        />
      ) : (
        <View className="flex-1 px-screen-x">
          <TransactionForm
            submitLabel="Salvar"
            isSubmitting={updateTransaction.isPending}
            submitError={
              updateTransaction.isError
                ? updateTransaction.error instanceof Error
                  ? updateTransaction.error.message
                  : 'Não foi possível salvar a transação.'
                : undefined
            }
            onSubmit={handleSubmit}
            onDelete={handleDelete}
            isDeleting={deleteTransaction.isPending}
            initialValues={{
              type: transaction.type,
              description: transaction.description,
              amount: String(transaction.amount).replace('.', ','),
              date: transaction.date,
              categoriesId: transaction.categories_id,
              receiptUrl: transaction.receipt_url,
            }}
          />
        </View>
      )}
    </ScreenContainer>
  );
}
