import type { IProfileRepository } from './domain/repositories/profile.repository';
import { firebaseProfileRepository } from './infrastructure/firebase/firebase-profile-repository';

/** Composition root do module: único ponto que escolhe a implementação concreta do repositório. */
export const profileRepository: IProfileRepository = firebaseProfileRepository;
