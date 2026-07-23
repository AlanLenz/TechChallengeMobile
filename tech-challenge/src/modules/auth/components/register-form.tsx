import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { Controller, useForm } from 'react-hook-form';
import { View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/ui/typography';
import { ROUTES } from '@/constants/routes';

import { AUTH_FORM_DEFAULTS } from '../constants';
import { useRegister } from '../hooks/use-register';
import { registerSchema, type RegisterFormValues } from '../validations';

export function RegisterForm() {
  const router = useRouter();
  const register = useRegister();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: AUTH_FORM_DEFAULTS.register,
  });

  const onSubmit = handleSubmit((values) => register.mutate(values));

  return (
    <View className="gap-4">
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <Input
            label="Nome completo"
            error={errors.name?.message}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
          />
        )}
      />
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
      {register.isError ? (
        <Typography variant="small" className="text-danger-500">
          {register.error instanceof Error ? register.error.message : 'Não foi possível criar a conta.'}
        </Typography>
      ) : null}
      <Button label="Criar conta" onPress={onSubmit} loading={register.isPending} />
      <Button label="Já tenho conta" variant="ghost" onPress={() => router.push(ROUTES.AUTH.LOGIN)} />
    </View>
  );
}
