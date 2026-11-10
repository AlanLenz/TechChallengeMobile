# Clean Architecture — ByteBank Mobile

Complementa `docs/architecture.md` (visão geral, navegação, stack). Onde os dois divergirem sobre
a estrutura interna de `src/modules/*`, **este documento vale**: a seção 7 do arquivo antigo
(`components/`, `hooks/`, `services/` dentro do module) descreve o layout anterior à adoção das camadas.

## Visão geral

Cada feature em `src/modules/<feature>` é dividida em camadas concêntricas. A regra única:
**o código-fonte só aponta para dentro** (`presentation → application → domain`; `infrastructure → domain`).
O app é pequeno, então a arquitetura é deliberadamente enxuta: só existe uma camada/arquivo quando há uma
necessidade concreta.

## Estrutura de diretórios

```text
src/modules/<feature>/
├── domain/                  # regras puras, sem framework/SDK
│   ├── entities/            # tipos e schemas Zod do negócio (Transaction, validação do formulário)
│   ├── rules/               # regras de valor (ex.: tipos/tamanho de comprovante aceitos)
│   ├── services/            # funções puras de domínio (filtro, métricas)
│   └── repositories/        # contratos (ITransactionRepository, IAuthRepository, ...)
├── application/             # casos de uso que orquestram o repositório (só onde há orquestração)
├── infrastructure/
│   └── firebase/            # implementação dos contratos usando src/firebase/*
├── presentation/
│   ├── components/          # telas e componentes do module
│   ├── hooks/               # hooks de UI / React Query / Context
│   └── context/             # estado compartilhado do module (TransactionsProvider)
├── container.ts             # composition root: escolhe a implementação concreta do repositório
├── constants.ts             # chaves de query, opções de UI, paths de storage
├── utils.ts                 # helpers de apresentação (formatação, paginação)
└── index.tsx                # API pública do module
```

Fora dos modules: `src/app` (rotas), `src/components`, `src/layouts`, `src/contexts` (sessão, tema,
conectividade...), `src/firebase` (únicos wrappers do SDK), `src/utils`, `src/lib`.

## Responsabilidades por camada

| Camada | Pertence | Não pertence |
|---|---|---|
| domain | entidades, schemas Zod, regras, serviços puros, interfaces de repositório | React, Expo, Firebase, React Query, imports de `presentation`/`infrastructure`/`constants` |
| application | casos de uso que combinam chamadas ao repositório (ex.: criar transação + enviar comprovante) | UI, SDKs, estado de React |
| infrastructure | implementação dos repositórios via `@/firebase/*`, mapeamento de erros e paths de storage | regras de negócio, UI |
| presentation | telas, hooks, Context, loading/erro, React Query | acesso a `@/firebase/*` ou `infrastructure/` |

`index.tsx` expõe só telas, hooks/Provider e tipos que outros modules realmente usam — **nunca** repositórios.

## Regras de dependência

Permitido: `presentation → application/domain`, `presentation → container.ts`, `container.ts → infrastructure`,
`infrastructure → domain`, `application → domain`, qualquer camada → `@/utils`, `@/types`, `@/validations`.
Proibido (e verificado por ESLint em `eslint.config.js`):

- `domain`/`application` importando `presentation`, `infrastructure`, `container`, `constants`, `@/firebase`,
  `@/contexts`, `@/components`, `@/lib`, `@/services`, React, Expo, TanStack ou o SDK do Firebase;
- `presentation` importando `infrastructure/` ou `@/firebase/*`;
- importar um module por outro caminho que não seja o `index.tsx` (regra `boundaries/entry-point`);
- ciclos de import (verificado por script, ver "Validação").

## Fluxo de execução — criar transação com comprovante

1. `TransactionForm` (presentation) valida com `transactionFormSchema` (domain) e chama `useCreateTransaction`.
2. O hook chama `createTransaction` do `TransactionsProvider` (presentation/context), que conhece o usuário logado.
3. O Provider executa `createTransactionWithReceipt(transactionRepository, uid, input)` (application).
4. O caso de uso usa apenas a interface `ITransactionRepository` (domain): cria o documento, envia o arquivo e o vincula.
5. `transactionRepository` (`container.ts`) é o `firebaseTransactionRepository` (infrastructure), que fala com `@/firebase/firestore` e `@/firebase/storage`.
6. O Provider invalida a query e a lista é recarregada; as métricas são recalculadas por `calculateTransactionMetrics` (domain).

## Alterações realizadas

- **Provider de transações** movido de `src/contexts/` para `modules/transactions/presentation/context/`: removeu o ciclo
  `contexts → modules/transactions → presentation → contexts` e o acesso a funções concretas do Firebase via `index.tsx`.
- **Orquestração extraída** do Provider para `application/transaction.use-cases.ts` (criar/atualizar com comprovante, mesma sequência de antes).
- **Métricas** (saldo, entradas, saídas, categorias) extraídas para `domain/services/transaction-metrics.service.ts`.
- **Domínio de transações isolado**: regras de comprovante foram de `constants.ts`/`utils.ts` para `domain/rules/receipt.rules.ts`;
  `filterTransactions` foi para `domain/services/`; o domínio deixou de importar `@/lib/react-query`.
  Helper de nome aleatório de arquivo agora é privado da infraestrutura; `utils.ts` ficou só com helpers de apresentação.
- **Ports + container** para `auth`, `profile`, `home` (e `transactions`): hooks não importam mais a implementação Firebase.
- **API pública de `modules/transactions`** não exporta mais as funções do repositório.
- **Ciclo `index.tsx` ↔ `transactions-screen`** removido (preload movido para `presentation/preload-module.ts`).
- **ESLint** passou a impor as regras de camada acima.

## Estruturas preservadas

`src/app` (casca de rotas), `src/components`, `src/layouts`, `src/firebase`, `src/utils`, `AuthContext`/demais contexts globais,
entidades e `ITransactionRepository` existentes, a regra de entry-point dos modules, `firestore.rules`/`storage.rules`,
endpoints, coleções e caminhos de Storage (inalterados).

## Convenções para futuras implementações

1. Nova regra de negócio pura → `domain/` (sem imports proibidos). Fluxo com mais de uma chamada ao repositório → `application/`.
2. Novo acesso a dados: adicione o método na interface em `domain/repositories`, implemente em `infrastructure/firebase`, exponha via `container.ts`.
3. Hooks e componentes usam o repositório só através de `container.ts` (ou de um caso de uso).
4. Não crie interface/caso de uso para repasse trivial sem necessidade; não exporte repositórios no `index.tsx`.
5. Antes de abrir PR: `npx tsc --noEmit` e `npx expo lint`.

## Limitações conhecidas

- `AuthContext` (`src/contexts`) ainda usa `@/firebase/auth` diretamente e expõe o tipo `User` do Firebase; é gestão de sessão transversal e trocá-lo exigiria alterar todos os consumidores de `user`.
- Não há framework de testes no projeto; a validação é por tsc, lint e verificação de ciclos.
