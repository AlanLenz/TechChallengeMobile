import { AuthLayout } from '@/layouts/auth-layout';

import { RegisterForm } from './register-form';

export function RegisterScreen() {
  return (
    <AuthLayout title="Criar conta" subtitle="Leva menos de um minuto">
      <RegisterForm />
    </AuthLayout>
  );
}
