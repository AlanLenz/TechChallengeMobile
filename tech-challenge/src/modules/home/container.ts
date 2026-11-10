import type { IHomeRepository } from './domain/repositories/home.repository';
import { firebaseHomeRepository } from './infrastructure/firebase/firebase-home-repository';

/** Composition root do module: único ponto que escolhe a implementação concreta do repositório. */
export const homeRepository: IHomeRepository = firebaseHomeRepository;
