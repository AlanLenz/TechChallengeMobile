import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';

import { AUTH_FORM_DEFAULTS } from '../constants';
import { useLogin } from '../hooks/use-login';
import { loginSchema, type LoginFormValues } from '../validations';

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: AUTH_FORM_DEFAULTS.login,
  });

  const onSubmit = handleSubmit((values) => login.mutate(values));

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
      <Controller
        control={control}
        name="password"
        render={({ field }) => (
          <Input
            label="Senha"
            secureTextEntry
            error={errors.password?.message}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
      {login.isError ? (
        <Typography variant="small" className="text-danger-500">
          {login.error instanceof Error ? login.error.message : 'Não foi possível entrar.'}
        </Typography>
      ) : null}
      <Button label="Entrar" onPress={onSubmit} loading={login.isPending} />
      <Button
        label="Esqueci minha senha"
        variant="ghost"
        onPress={() => router.push(ROUTES.AUTH.FORGOT_PASSWORD)}
      />
      <Button label="Criar conta" variant="secondary" onPress={() => router.push(ROUTES.AUTH.REGISTER)} />
    </View>
  );
}
