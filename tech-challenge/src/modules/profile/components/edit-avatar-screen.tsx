import { useRouter } from 'expo-router';

import { Header } from '@/components/layout/header';
import { ScreenContainer } from '@/components/layout/screen-container';

import { AvatarPickerForm } from './avatar-picker-form';

export function EditAvatarScreen() {
  const router = useRouter();

  return (
    <ScreenContainer edges={['top']} className="gap-6 px-0">
      <Header title="Editar foto" onBack={() => router.back()} />
      <AvatarPickerForm />
    </ScreenContainer>
  );
}
