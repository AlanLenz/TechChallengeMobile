import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { useAuthContext } from '@/contexts/auth-context';
import { getFileUrl, uploadFile } from '@/firebase/storage';

import { useCreateTransfer } from '../hooks/use-create-transfer';
import type { TransferFormValues } from '../validations';
import { TransferForm } from './transfer-form';

export function NewTransferScreen() {
  const router = useRouter();
  const { user } = useAuthContext();
  const createTransfer = useCreateTransfer();

  const handleSubmit = async (values: TransferFormValues) => {
    let receiptUrl = values.receiptUrl;

    if (values.receiptUri) {
      const path = `users/${user!.uid}/transfers/${Date.now()}-receipt.jpg`;
      const blob = await (await fetch(values.receiptUri)).blob();
      await uploadFile(path, blob);
      receiptUrl = await getFileUrl(path);
    }

    await createTransfer.mutateAsync({ ...values, receiptUrl });
    router.back();
  };

  return (
    <ScreenContainer edges={['top']} className="gap-6 px-0">
      <View className="py-3 bg-primary-500">
        <Header title="Nova transferência" onBack={() => router.back()} />
      </View>
      <View className="flex-1 px-screen-x">
        <TransferForm
          submitLabel="Adicionar transferência"
          isSubmitting={createTransfer.isPending}
          submitError={
            createTransfer.isError
              ? createTransfer.error instanceof Error
                ? createTransfer.error.message
                : 'Não foi possível salvar a transferência.'
              : undefined
          }
          onSubmit={handleSubmit}
        />
      </View>
    </ScreenContainer>
  );
}
