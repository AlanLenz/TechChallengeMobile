import { AuthLayout } from '@/layouts/auth-layout';

import { ForgotPasswordForm } from './forgot-password-form';

export function ForgotPasswordScreen() {
  return (
    <AuthLayout title="Recuperar senha" subtitle="Enviaremos um link de redefinição para seu e-mail">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
