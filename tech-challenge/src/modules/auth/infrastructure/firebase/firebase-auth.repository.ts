import {
  getAuthErrorMessage,
  reloadCurrentUser,
  resetPassword,
  sendVerificationEmail,
  signIn,
  signOut,
  signUp,
  subscribeToAuthChanges,
  type User,
} from '@/firebase/auth';

import type { AuthUser } from '../../domain/entities/auth.entity';
import type { IAuthRepository } from '../../domain/repositories/auth.repository';

function toAuthUser(user: User | null): AuthUser | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
}

async function withDomainError<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export const firebaseAuthRepository: IAuthRepository = {
  signIn: (email, password) =>
    withDomainError(async () => {
      await signIn(email, password);
    }),
  signUp: (name, email, password) =>
    withDomainError(async () => {
      await signUp(name, email, password);
    }),
  signOut: () => withDomainError(signOut),
  requestPasswordReset: (email) => withDomainError(() => resetPassword(email)),
  sendVerificationEmail: () => withDomainError(sendVerificationEmail),
  reloadCurrentUser: async () => toAuthUser(await reloadCurrentUser()),
  subscribeToAuthChanges: (callback) =>
    subscribeToAuthChanges((user) => callback(toAuthUser(user))),
};
