export interface IAuthRepository {
  login(email: string, password: string): Promise<void>;
  register(name: string, email: string, password: string): Promise<void>;
  requestPasswordReset(email: string): Promise<void>;
}
