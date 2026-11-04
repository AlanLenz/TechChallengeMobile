import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ScreenContainer } from '@/components/layout/screen-container';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Typography } from '@/components/ui/typography';
import { useAuthContext } from '@/contexts/auth-context';
import { colors } from '@/theme';

export function BiometricLockScreen() {
  const { user, biometricLabel, unlockWithBiometrics, signOut } = useAuthContext();
  const [isPrompting, setIsPrompting] = useState(true);
  const [failedAttempt, setFailedAttempt] = useState(false);

  const handleUnlock = async () => {
    setIsPrompting(true);
    setFailedAttempt(false);
    try {
      const unlocked = await unlockWithBiometrics();
      if (!unlocked) {
        setFailedAttempt(true);
      }
    } finally {
      setIsPrompting(false);
    }
  };

  useEffect(() => {
    let active = true;
    unlockWithBiometrics()
      .then((unlocked) => {
        if (active && !unlocked) {
          setFailedAttempt(true);
        }
      })
      .finally(() => {
        if (active) {
          setIsPrompting(false);
        }
      });

    return () => {
      active = false;
    };
  }, [unlockWithBiometrics]);

  const displayName = user?.displayName || user?.email || 'sua conta';

  return (
    <ScreenContainer className="justify-center px-screen-x">
      <Card className="items-center gap-6 p-6">
        <View className="h-20 w-20 items-center justify-center rounded-full bg-primary-50 dark:bg-neutral-800">
          <Ionicons name="finger-print-outline" size={44} color={colors.primary[500]} />
        </View>

        <View className="items-center gap-2">
          <Typography variant="subtitle" className="text-center">
            Sessão protegida
          </Typography>
          <Typography variant="body" className="text-center text-neutral-600 dark:text-neutral-300">
            Confirme sua identidade com {biometricLabel} para continuar acessando {displayName}.
          </Typography>
        </View>

        {failedAttempt ? (
          <Typography variant="small" className="text-center text-danger-500">
            Autenticação não confirmada. Tente novamente ou entre com sua senha.
          </Typography>
        ) : null}

        <View className="w-full gap-3">
          <Button
            label={`Desbloquear com ${biometricLabel}`}
            onPress={handleUnlock}
            loading={isPrompting}
          />
          <Button
            label="Entrar com outra conta ou senha"
            variant="ghost"
            onPress={() => void signOut()}
            disabled={isPrompting}
          />
        </View>
      </Card>
    </ScreenContainer>
  );
}
