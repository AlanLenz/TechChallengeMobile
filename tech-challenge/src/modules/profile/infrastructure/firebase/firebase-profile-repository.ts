import { updateCurrentUserProfile } from '@/firebase/auth';
import { getFileUrl, uploadFile } from '@/firebase/storage';

import type { IProfileRepository } from '../../domain/repositories/profile.repository';

function getAvatarStoragePath(userId: string): string {
  return `avatars/${userId}.jpg`;
}

export const firebaseProfileRepository: IProfileRepository = {
  async updateAvatar(userId, image) {
    const path = getAvatarStoragePath(userId);
    await uploadFile(path, image);
    const url = await getFileUrl(path);
    await updateCurrentUserProfile({ photoURL: url });
    return url;
  },
};
