export interface IProfileRepository {
  /** Envia a nova foto e atualiza o perfil do usuário; devolve a URL pública da imagem. */
  updateAvatar(userId: string, blob: Blob): Promise<string>;
}
