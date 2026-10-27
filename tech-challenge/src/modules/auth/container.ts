import type { IAuthRepository } from './domain/repositories/auth.repository';
import { firebaseAuthRepository } from './infrastructure/firebase/firebase-auth.repository';

/** Composition root do module: único ponto que escolhe a implementação concreta do repositório. */
export const authRepository: IAuthRepository = firebaseAuthRepository;
