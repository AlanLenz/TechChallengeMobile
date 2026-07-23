import { useRouter } from 'expo-router';
import { View } from 'react-native';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';
import { TransferForm } from '@/modules/transfers';

export default function NewTransfer() {
  const router = useRouter();

  return (
    <ScreenContainer edges={['top']} className="gap-6 px-0">
      <Header title="Nova transferência" onBack={() => router.back()} />
      <View className="px-screen-x">
        <TransferForm />
      </View>
    </ScreenContainer>
  );
}
