import type { AccountSummary } from '../domain/entities/home.entity';
import type { IAccountRepository } from '../domain/repositories/account.repository';

export class GetAccountsSummaryUseCase {
  constructor(private readonly repository: IAccountRepository) {}

  execute(userId: string): Promise<AccountSummary[]> {
    return this.repository.getAccountsSummary(userId);
  }
}
