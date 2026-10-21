import type { AccountSummary } from '../entities/home.entity';

/** Port de leitura das contas do usuário — implementado na camada de infraestrutura. */
export interface IAccountRepository {
  getAccountsSummary(userId: string): Promise<AccountSummary[]>;
}
