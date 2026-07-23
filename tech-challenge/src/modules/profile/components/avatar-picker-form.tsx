import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/ui/typography';

import { useProfile } from '../hooks/use-profile';
import { useUpdateAvatar } from '../hooks/use-update-avatar';

export function AvatarPickerForm() {
  const router = useRouter();
  const { name, photoUrl } = useProfile();
  const updateAvatar = useUpdateAvatar();
  const [pickedUri, setPickedUri] = useState<string | undefined>(undefined);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (!result.canceled) {
      setPickedUri(result.assets[0].uri);
    }
  };

  const onSave = async () => {
    if (!pickedUri) return;
    const blob = await (await fetch(pickedUri)).blob();
    updateAvatar.mutate(blob, { onSuccess: () => router.back() });
  };

  return (
    <View className="items-center gap-6">
      <Avatar name={name || 'Usuário'} photoUrl={pickedUri ?? photoUrl} size={96} />
      <Button label="Escolher foto" variant="secondary" onPress={pickImage} />
      {updateAvatar.isError ? (
        <Typography variant="small" className="text-danger-500">
          Não foi possível atualizar a foto.
        </Typography>
      ) : null}
      <Button label="Salvar" onPress={onSave} loading={updateAvatar.isPending} disabled={!pickedUri} />
    </View>
  );
}
