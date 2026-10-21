import { UpdateAvatarUseCase } from './application/update-avatar.use-case';
import { firebaseProfileRepository } from './infrastructure/firebase/firebase-profile-repository';

/** Composition root do module: liga os use cases à implementação Firebase do port de perfil. */
export const profileUseCases = {
  updateAvatar: new UpdateAvatarUseCase(firebaseProfileRepository),
};
