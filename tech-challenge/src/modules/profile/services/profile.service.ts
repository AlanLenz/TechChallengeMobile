import { updateCurrentUserProfile } from '@/firebase/auth';
import { getFileUrl, uploadFile } from '@/firebase/storage';

import { getAvatarStoragePath } from '../constants';

export async function updateAvatar(userId: string, blob: Blob): Promise<string> {
  const path = getAvatarStoragePath(userId);
  await uploadFile(path, blob);
  const url = await getFileUrl(path);
  await updateCurrentUserProfile({ photoURL: url });
  return url;
}
