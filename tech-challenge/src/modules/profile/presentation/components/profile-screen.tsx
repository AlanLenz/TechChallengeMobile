import { useState } from 'react';
import { View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Divider } from '@/components/ui/divider';
import { Typography } from '@/components/ui/typography';
import { useAuthContext } from '@/contexts/auth-context';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';

import { useProfile } from '../hooks/use-profile';

export function ProfileScreen() {
  const { signOut } = useAuthContext();
  const { name, email, photoUrl, isEmailVerified, sendVerificationEmail } = useProfile();
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSendVerification = async () => {
    try {
      setIsSending(true);
      setResendStatus(null);
      await sendVerificationEmail();
      setResendStatus('E-mail de verificação enviado! Verifique sua caixa de entrada.');
    } catch {
      setResendStatus('Não foi possível enviar o e-mail no momento. Tente novamente mais tarde.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <TabScreenLayout title="Perfil">
      <View className="items-center gap-3 py-6">
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

        <Badge
          label={isEmailVerified ? 'E-mail verificado' : 'E-mail não verificado'}
          tone={isEmailVerified ? 'success' : 'warning'}
        />

        {!isEmailVerified ? (
          <View className="items-center gap-2 mt-1">
            <Button
              label={isSending ? 'Enviando...' : 'Reenviar confirmação de e-mail'}
              variant="secondary"
              loading={isSending}
              onPress={handleSendVerification}
            />
            {resendStatus ? (
              <Typography variant="small" className="text-center text-neutral-600 dark:text-neutral-400">
                {resendStatus}
              </Typography>
            ) : null}
          </View>
        ) : null}
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
