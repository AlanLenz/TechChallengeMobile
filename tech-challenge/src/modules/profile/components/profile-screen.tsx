import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Typography } from '@/components/ui/typography';
import { useAuthContext } from '@/contexts/auth-context';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';

import { useProfile } from '../hooks/use-profile';

export function ProfileScreen() {
  const { signOut } = useAuthContext();
  const { name, email, photoUrl } = useProfile();

  return (
    <TabScreenLayout title="Perfil">
      <View className="items-center gap-3 py-6">

        {/* Edição de avatar será implementada posteriormente.
        <Pressable onPress={() => router.push(ROUTES.MODALS.EDIT_AVATAR)}>
          <Avatar
            name={name || email || 'Usuário'}
            photoUrl={photoUrl}
            size={80}
          />
        </Pressable>
        */}

        <Avatar
          name={name || email || 'Usuário'}
          photoUrl={photoUrl}
          size={80}
        />

        <View className="items-center gap-1">
          <Typography variant="subtitle">
            {name || 'Sem nome cadastrado'}
          </Typography>

          <Typography variant="small">
            {email}
          </Typography>
        </View>
      </View>

      <Divider />

      <View className="pt-6">
        <Button
          label="Sair"
          variant="danger"
          onPress={signOut}
        />
      </View>
    </TabScreenLayout>
  );
}