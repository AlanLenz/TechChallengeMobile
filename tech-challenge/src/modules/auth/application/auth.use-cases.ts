import type { AuthUser, ForgotPasswordInput, LoginInput, RegisterInput } from '../domain/entities/auth.entity';
import type { IAuthRepository } from '../domain/repositories/auth.repository';

export class LoginUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute({ email, password }: LoginInput): Promise<void> {
    return this.repository.signIn(email, password);
  }
}

export class RegisterUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute({ name, email, password }: RegisterInput): Promise<void> {
    return this.repository.signUp(name, email, password);
  }
}

export class SignOutUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute(): Promise<void> {
    return this.repository.signOut();
  }
}

export class RequestPasswordResetUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute({ email }: ForgotPasswordInput): Promise<void> {
    return this.repository.requestPasswordReset(email);
  }
}

export class SendVerificationEmailUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute(): Promise<void> {
    return this.repository.sendVerificationEmail();
  }
}

export class RefreshUserUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute(): Promise<AuthUser | null> {
    return this.repository.reloadCurrentUser();
  }
}

export class ObserveAuthStateUseCase {
  constructor(private readonly repository: IAuthRepository) {}

  execute(callback: (user: AuthUser | null) => void): () => void {
    return this.repository.subscribeToAuthChanges(callback);
  }
}
