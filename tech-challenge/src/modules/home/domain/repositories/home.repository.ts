import type { AccountSummary } from '../entities/home.entity';

export interface IHomeRepository {
  getAccountsSummary(userId: string): Promise<AccountSummary[]>;
}
