import {
  LoginUseCase,
  ObserveAuthStateUseCase,
  RefreshUserUseCase,
  RegisterUseCase,
  RequestPasswordResetUseCase,
  SendVerificationEmailUseCase,
  SignOutUseCase,
} from './application/auth.use-cases';
import { firebaseAuthRepository } from './infrastructure/firebase/firebase-auth.repository';

/** Composition root do module: liga os use cases à implementação Firebase do port de auth. */
const repository = firebaseAuthRepository;

export const authUseCases = {
  login: new LoginUseCase(repository),
  register: new RegisterUseCase(repository),
  signOut: new SignOutUseCase(repository),
  requestPasswordReset: new RequestPasswordResetUseCase(repository),
  sendVerificationEmail: new SendVerificationEmailUseCase(repository),
  refreshUser: new RefreshUserUseCase(repository),
  observeAuthState: new ObserveAuthStateUseCase(repository),
};
