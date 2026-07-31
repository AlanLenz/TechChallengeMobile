import { isMockModeEnabled } from '@/config/mock-mode';
import { MOCK_CREDENTIALS } from '@/mocks/data';

// Em modo mock, pré-preenche o login com as credenciais fictícias (ver src/mocks/data.ts) para
// não depender de o dev saber/lembrar delas. Remove-se sozinho quando o modo mock é desativado.
export const AUTH_FORM_DEFAULTS = {
  login: isMockModeEnabled ? { ...MOCK_CREDENTIALS } : { email: '', password: '' },
  register: { name: '', email: '', password: '' },
  forgotPassword: { email: '' },
} as const;
