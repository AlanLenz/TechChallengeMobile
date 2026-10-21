export type LoginInput = { email: string; password: string };
export type RegisterInput = { name: string; email: string; password: string };
export type ForgotPasswordInput = { email: string };

/** Usuário autenticado, independente do provedor de identidade (Firebase, etc.). */
export type AuthUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
};
