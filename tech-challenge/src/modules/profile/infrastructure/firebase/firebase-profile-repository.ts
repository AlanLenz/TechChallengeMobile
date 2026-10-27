import { updateCurrentUserProfile } from '@/firebase/auth';
import { getFileUrl, uploadFile } from '@/firebase/storage';

import { getAvatarStoragePath } from '../../constants';
import type { IProfileRepository } from '../../domain/repositories/profile.repository';

async function updateAvatar(userId: string, blob: Blob): Promise<string> {
  const path = getAvatarStoragePath(userId);
  await uploadFile(path, blob);
  const url = await getFileUrl(path);
  await updateCurrentUserProfile({ photoURL: url });
  return url;
}


export const firebaseProfileRepository: IProfileRepository = { updateAvatar };
