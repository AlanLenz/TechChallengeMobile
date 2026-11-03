import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Pressable, Switch, View } from 'react-native';

import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { Typography } from '@/components/ui/typography';
import { useAppContext } from '@/contexts/app-context';
import { useAuthContext } from '@/contexts/auth-context';
import { TabScreenLayout } from '@/layouts/tab-screen-layout';
import { colors } from '@/theme';
import { maskEmailAddress } from '@/utils/crypto';

import { useProfile } from '../hooks/use-profile';

export function ProfileScreen() {
  const { signOut } = useAuthContext();
  const { areValuesVisible, toggleValuesVisibility } = useAppContext();
  const {
    name,
    email,
    photoUrl,
    isEmailVerified,
    sendVerificationEmail,
    isBiometricSupported,
    biometricLabel,
    isBiometricEnabled,
    toggleBiometricLock,
  } = useProfile();
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isTogglingBiometrics, setIsTogglingBiometrics] = useState(false);
  const [showFullEmail, setShowFullEmail] = useState(false);

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

  const handleToggleBiometrics = async (nextValue: boolean) => {
    if (isTogglingBiometrics) return;
    setIsTogglingBiometrics(true);
    try {
      await toggleBiometricLock(nextValue);
    } finally {
      setIsTogglingBiometrics(false);
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

          {email ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={showFullEmail ? 'Ocultar e-mail completo' : 'Mostrar e-mail completo'}
              onPress={() => setShowFullEmail((v) => !v)}
              hitSlop={8}
              className="flex-row items-center gap-1.5"
            >
              <Typography variant="small">
                {showFullEmail ? email : maskEmailAddress(email)}
              </Typography>
              <Ionicons
                name={showFullEmail ? 'eye-off-outline' : 'eye-outline'}
                size={15}
                color={colors.neutral[600]}
              />
            </Pressable>
          ) : null}
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

      <View className="gap-3 py-6">
        <Typography variant="subtitle">Segurança</Typography>

        <Card className="flex-row items-center justify-between gap-4">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-neutral-800">
              <Ionicons name="finger-print-outline" size={22} color={colors.primary[500]} />
            </View>
            <View className="flex-1 gap-0.5">
              <Typography variant="body" className="font-semibold">
                Desbloqueio por {biometricLabel}
              </Typography>
              <Typography variant="small" className="text-neutral-600 dark:text-neutral-300">
                {isBiometricSupported
                  ? 'Exigir autenticação biométrica ao abrir ou retomar o aplicativo'
                  : 'Biometria não disponível ou não cadastrada neste dispositivo'}
              </Typography>
            </View>
          </View>

          <Switch
            value={isBiometricEnabled}
            onValueChange={handleToggleBiometrics}
            disabled={!isBiometricSupported || isTogglingBiometrics}
            trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
            accessibilityLabel={`Ativar ou desativar desbloqueio por ${biometricLabel}`}
          />
        </Card>

        <Card className="flex-row items-center justify-between gap-4">
          <View className="flex-row items-center gap-3 flex-1">
            <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-100 dark:bg-neutral-800">
              <Ionicons name="eye-off-outline" size={22} color={colors.primary[500]} />
            </View>
            <View className="flex-1 gap-0.5">
              <Typography variant="body" className="font-semibold">
                Ocultar valores financeiros
              </Typography>
              <Typography variant="small" className="text-neutral-600 dark:text-neutral-300">
                Mascarar saldos, entradas, saídas e valores de transações nas telas
              </Typography>
            </View>
          </View>

          <Switch
            value={!areValuesVisible}
            onValueChange={() => toggleValuesVisibility()}
            trackColor={{ false: colors.neutral[300], true: colors.primary[500] }}
            accessibilityLabel="Ativar ou desativar ocultação de valores financeiros"
          />
        </Card>
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
