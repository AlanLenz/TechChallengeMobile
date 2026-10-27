import { getAuthErrorMessage, resetPassword, signIn, signUp } from '@/firebase/auth';

import type { IAuthRepository } from '../../domain/repositories/auth.repository';

async function login(email: string, password: string): Promise<void> {
  try {
    await signIn(email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

async function register(name: string, email: string, password: string): Promise<void> {
  try {
    await signUp(name, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

async function requestPasswordReset(email: string): Promise<void> {
  try {
    await resetPassword(email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export const firebaseAuthRepository: IAuthRepository = { login, register, requestPasswordReset };
