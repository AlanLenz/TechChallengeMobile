export const AUTH_FORM_DEFAULTS = {
  login: { email: '', password: '' },
  register: { name: '', email: '', password: '', confirmPassword: '' },
  forgotPassword: { email: '' },
} as const;
