import type { AuthUser } from '../entities/auth.entity';

/** Port de autenticação — implementado na camada de infraestrutura. Lança `Error` com mensagem de domínio. */
export interface IAuthRepository {
  signIn(email: string, password: string): Promise<void>;
  signUp(name: string, email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
  sendVerificationEmail(): Promise<void>;
  reloadCurrentUser(): Promise<AuthUser | null>;
  /** Notifica a sessão atual e cada mudança; devolve a função para cancelar a inscrição. */
  subscribeToAuthChanges(callback: (user: AuthUser | null) => void): () => void;
}
