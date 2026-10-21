import type { IProfileRepository } from '../domain/repositories/profile.repository';

export class UpdateAvatarUseCase {
  constructor(private readonly repository: IProfileRepository) {}

  execute(userId: string, image: Blob): Promise<string> {
    return this.repository.updateAvatar(userId, image);
  }
}
