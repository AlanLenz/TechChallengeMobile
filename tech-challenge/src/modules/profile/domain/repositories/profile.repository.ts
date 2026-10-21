/** Port de persistência do perfil do usuário — implementado na camada de infraestrutura. */
export interface IProfileRepository {
  /** Envia a nova foto, atualiza o perfil do usuário e devolve a URL pública da imagem. */
  updateAvatar(userId: string, image: Blob): Promise<string>;
}
