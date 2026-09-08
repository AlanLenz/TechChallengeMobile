import { getAuthErrorMessage, resetPassword, signIn, signUp } from '@/firebase/auth';

export async function login(email: string, password: string) {
  try {
    return await signIn(email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function register(name: string, email: string, password: string) {
  try {
    return await signUp(name, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export async function requestPasswordReset(email: string) {
  try {
    await resetPassword(email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}
