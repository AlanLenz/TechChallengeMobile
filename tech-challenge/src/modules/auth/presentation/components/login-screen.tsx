import { AuthLayout } from '@/layouts/auth-layout';

import { LoginForm } from './login-form';

export function LoginScreen() {
  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta ByteBank">
      <LoginForm />
    </AuthLayout>
  );
}
