import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';

import { AUTH_FORM_DEFAULTS } from '../constants';
import { useForgotPassword } from '../hooks/use-forgot-password';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../validations';

export function ForgotPasswordForm() {
  const router = useRouter();
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: AUTH_FORM_DEFAULTS.forgotPassword,
  });

  const onSubmit = handleSubmit((values) => {
    forgotPassword.mutate(values, { onSuccess: () => setSent(true) });
  });

  if (sent) {
    return (
      <View className="gap-4">
        <Typography variant="body">
          Se existir uma conta com este e-mail, enviamos um link para redefinir a senha.
        </Typography>
        <Button label="Voltar para o login" variant="secondary" onPress={() => router.back()} />
      </View>
    );
  }

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="email"
        render={({ field }) => (
          <Input
            label="E-mail"
            autoCapitalize="none"
            keyboardType="email-address"
            error={errors.email?.message}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {forgotPassword.isError ? (
        <Typography variant="small" className="text-danger-500">
          {forgotPassword.error instanceof Error
            ? forgotPassword.error.message
            : 'Não foi possível enviar o e-mail.'}
        </Typography>
      ) : null}
      <Button label="Enviar link" onPress={onSubmit} loading={forgotPassword.isPending} />
    </View>
  );
}
