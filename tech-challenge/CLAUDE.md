@AGENTS.md

## Arquitetura

Cada feature em `src/modules/<feature>` segue Clean Architecture (`domain` / `application` / `infrastructure` / `presentation`).
Detalhes e regras completas: `docs/architecture/clean-architecture.md`. Resumo:

- `domain` e `application` não importam React, Expo, Firebase, TanStack, `presentation`, `infrastructure` nem `constants` (ESLint impõe).
- `presentation` não importa `infrastructure/` nem `@/firebase/*`; acessa dados via `container.ts` do module.
- Novo acesso a dados: interface em `domain/repositories` → implementação em `infrastructure/firebase` → exposição em `container.ts`.
- Outros modules só são importados pelo `index.tsx`, que não exporta repositórios.
- Verifique com `npx tsc --noEmit` e `npx expo lint`.
