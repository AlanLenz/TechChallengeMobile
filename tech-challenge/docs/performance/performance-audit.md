# Auditoria de performance — ByteBank Mobile

Data da auditoria: 2026-10-27 · Branch: `refactor/clean-architecture` (com as alterações de arquitetura ainda não commitadas) · Escopo do diagnóstico: somente análise. As otimizações aplicadas depois estão na seção 0.

## 0. Otimizações aplicadas após o diagnóstico

Medição "depois" com o mesmo método (Android, `expo export`, mesma flag `--dump-sourcemap`), sobre o mesmo código, só com estas mudanças.

| ID | Situação | O que foi feito | Resultado medido |
|---|---|---|---|
| PERF-01 | **Aplicado** | `format-date.ts` importa `ptBR` de `date-fns/locale/pt-BR` | `date-fns/locale` 896 KB → 14 KB; `date-fns` 1067 KB → ≈ 100 KB |
| PERF-05 | **Aplicado** | 11 arquivos passam a usar `@expo/vector-icons/Ionicons` | Assets: 46 arquivos / 5,06 MB → 28 / 1,38 MB (−3,7 MB). Restam Ionicons (390 KB) e MaterialSymbols (964 KB, vem de `@expo/ui`, fora do escopo) |
| PERF-04 | **Aplicado** | Removidos o prefetch de comprovantes no `TransactionsProvider`, `presentation/preload-receipts.ts` e o `preloadImage` do `onPressIn` do item (o pré-carregamento da tela de edição foi mantido) | Verificável só em rede/dispositivo: nenhuma requisição a Storage no login |
| PERF-03a | **Aplicado** | Create/update não aguardam mais o refetch (`invalidateQueries` em segundo plano); delete remove o item do cache com `setQueryData` e invalida em segundo plano | Tempo "Salvar → modal fechado" e leituras não medidos (sem dispositivo/credenciais). Leituras por mutação **continuam n** (o refetch segue ocorrendo) |
| PERF-09 | **Aplicado** | `retry` não repete `permission-denied`/`unauthenticated` | Não medido |
| PERF-02 | **Abandonado (spike)** | `zod/mini` e até `zod/v4/core` reexportam `locales` (`export * as locales`), então trocar de entry não remove os 438 KB. A única saída seria um resolver customizado no Metro, frágil a cada atualização do `zod` | Sem mudança |
| PERF-03b, 07, 08, 12 | Não aplicados | Dependem de decisão de produto/UX (03b, 07, 08) ou de profiling em dispositivo (12) | — |
| PERF-06, 10, 11 | Não aplicados | O próprio relatório recomenda manter | — |

**Resultado agregado (Android):** JS minificado 6,9 MB → 5,5 MB (−20%); bundle Hermes `.hbc` 7,5 MB → 6,3 MB (−16%); assets 5,06 MB → 1,38 MB.

**Trade-off do PERF-03a:** após criar ou editar, a lista pode exibir por instantes o dado anterior até o refetch terminar (após excluir isso não ocorre, o item some na hora).

Verificações: `tsc --noEmit` sem erros, `expo lint` 0 erros (2 avisos que já existiam), sem ciclos de import, `package.json`/lockfile inalterados. Não há testes automatizados no projeto, e o comportamento em dispositivo **não foi testado**.

---

Legenda de confiança usada em todo o documento:

- **Confirmado** — medido (bundle/sourcemap) ou verificável diretamente no código.
- **Derivado** — consequência lógica do código, sem medição em dispositivo.
- **Suspeita** — plausível, mas precisa de profiling para ser comprovada.

---

## 1. Resumo executivo

O app é um cliente Expo (SDK 57) / React Native 0.86 com Expo Router, NativeWind, React Query e Firebase (Auth, Firestore, Storage). O React Compiler está habilitado (`app.json` → `experiments.reactCompiler`), então a maior parte da memoização manual seria redundante; os problemas relevantes **não estão em re-renderizações**, e sim em **tamanho de bundle, custo de dados por operação e trabalho de rede/UX nas mutações**.

Principais conclusões:

1. **~1,3 MB (≈23%) do JS minificado são locales que o app não usa**: `date-fns/locale` (896 KB, 98 locales para usar só `ptBR`, que tem 10 KB) e `zod/v4/locales` (438 KB). **Confirmado** por sourcemap.
2. **Cada mutação (criar/editar/excluir) re-baixa e re-lê toda a coleção de transações e a tela só fecha depois disso** (`await invalidateQueries`). A consulta não tem `limit`, `orderBy` nem paginação no servidor. **Confirmado no código**; impacto cresce linearmente com o número de transações e é cobrado em leituras do Firestore.
3. **Pré-carregamento de comprovantes não tem consumidor**: até 10 comprovantes (imagens *e PDFs*, até 5 MB cada) são baixados para o cache do `expo-image`, mas o app só abre comprovantes pelo navegador do sistema (`WebBrowser`). **Confirmado no código**; volume real depende dos dados dos usuários.
4. **20 fontes de ícones (5,04 MB) entram nos assets exportados; só o Ionicons (390 KB) é usado.** **Confirmado no export**; efeito em APK/IPA de release não foi verificado.
5. O lazy loading dos gráficos **não reduz download no Android/iOS** (um único bundle Hermes de 7,5 MB, sem chunks) e é anulado por chamadas de preload no import. Só tem efeito real na web. **Confirmado**.
6. Não foram encontrados: requisições duplicadas, polling, padrão N+1, listas sem paginação de renderização, nem re-renderizações problemáticas comprovadas.

Limitação principal: **não há medições de runtime em dispositivo** (LCP/INP/CLS/FCP/TTFB não se aplicam ao app nativo e não foi possível executar o app autenticado — ver seção 3).

---

## 2. Arquitetura e otimizações já existentes (contexto)

| Aspecto | Situação atual |
|---|---|
| Roteamento | Expo Router (`src/app`, cascas finas), `Tabs` com `lazy` padrão do React Navigation |
| Estado de servidor | React Query; **um único** `useQuery` de transações em `TransactionsProvider` (montado na raiz), `staleTime` 30 s; padrão global `staleTime` 60 s, `retry: 2`, `refetchOnWindowFocus: false` |
| Estado de cliente | Contexts (`Auth`, `Theme`, `Connectivity`, `Notification`, `App`) |
| Dados | Firestore `getDocs` da coleção inteira `users/{uid}/transactions` (`firebase/firestore.ts: queryCollection`), filtro e paginação **no cliente** (`TRANSACTIONS_PAGE_SIZE = 10`) |
| Já otimizado | Gráficos importados por subcaminho (`react-native-gifted-charts/dist/BarChart`, `/PieChart`); edição lê a transação do cache (`useTransaction`, sem requisição extra); animações com `useNativeDriver`; `FlatList` + paginação de 10 itens; `Image` com `cachePolicy="memory-disk"`; preloads de tela/ícone/avatar (commit `3565db5`) |
| Build | Metro padrão + NativeWind; Hermes; React Compiler ligado; sem análise de bundle configurada |

---

## 3. Metodologia, ambiente e limitações

**Ambiente:** Windows 10, Node 22.12, Expo SDK 57, `expo export` em modo produção (minificado).

**O que foi feito**

- `npx expo export --platform android --dump-sourcemap` → bundle Hermes (`.hbc`) e lista de assets.
- `npx expo export --platform android --no-bytecode --dump-sourcemap` → JS minificado + sourcemap; script próprio (decodifica o `mappings` e soma bytes gerados por arquivo-fonte) para atribuir tamanho a cada pacote/módulo. Os scripts ficaram fora do repositório.
- `npx expo export --platform web` → tamanhos de entry/chunks da web.
- Leitura do código de todas as telas, contexts, hooks, repositórios e serviços de dados.
- `grep` para confirmar consumidores (ex.: providers sem uso, ausência de `<Image>` de comprovantes).

**Limitações (não foram medidos)**

- **Sem profiling em dispositivo/emulador** (tempo de startup, TTI, frame drops, memória, JS thread). Nenhuma hipótese sobre custo de execução foi comprovada.
- **Sem execução autenticada**: há `.env` local, mas não usei credenciais nem dados reais. Logo, contagem de requisições e latência foram **derivadas do código**, não observadas em rede.
- **Métricas web (LCP, INP, CLS, FCP, TTFB)** não coletadas: o alvo é mobile nativo, Lighthouse não está no projeto e instalá-lo estava fora das regras. Medi apenas tamanho de bundle web.
- Percentuais de bundle são sobre o JS **minificado**; o bytecode Hermes (7,5 MB) não é proporcional ao JS (6,9 MB).
- Um teste auxiliar em Node (`require('date-fns/locale')` ≈ 1274 ms vs `require('date-fns/locale/pt-BR')` ≈ 23 ms, mediana de 5 execuções) **não é transferível para Hermes** (é dominado por I/O de ~100 arquivos no disco); serve apenas para indicar a diferença de trabalho de carga, não o custo no app.
- **Incidente:** a primeira tentativa de usar o Expo Atlas fez o Expo CLI instalar `expo-atlas` em `package.json`/`package-lock.json`. Reverti os dois arquivos (`git checkout`) e re-sincronizei `node_modules` com `npm install`; o `git status` confirma que ambos estão idênticos ao repositório e `tsc` continua passando. `node_modules` foi reinstalado (não versionado).

---

## 4. Métricas e evidências

### 4.1 Bundles

| Plataforma | Artefato | Tamanho |
|---|---|---|
| Android | `entry-*.hbc` (Hermes, **único**, sem chunks) | 7,5 MB |
| Android | mesmo bundle como JS minificado | 6,9 MB (5,7 MB atribuídos a módulos) |
| Android | assets exportados | 46 arquivos; **20 `.ttf` = 5,04 MB**, demais 22 KB |
| Web | `entry-*.js` | 5,7 MB |
| Web | `dashboard-charts-*.js` (chunk lazy) | 361 KB |
| Web | CSS | 16 KB |

### 4.2 Maiores contribuintes do JS minificado (Android, % do atribuído)

| Pacote | KB | % |
|---|---:|---:|
| `date-fns` (**896 KB só em `locale/`**) | 1067 | 18,7 |
| `react-native-reanimated` (+ `worklets` 90 KB) | 738 | 12,9 |
| `zod` (**438 KB em `v4/locales`**, 219 KB `v4/core`, 47 KB `classic`) | 705 | 12,4 |
| `react-native` | 566 | 9,9 |
| `expo-router` | 442 | 7,8 |
| `@firebase/firestore` (inclui `re2js` 142 KB à parte) | 400 | 7,0 |
| `gifted-charts-core` + `react-native-gifted-charts` | 286 | 5,0 |
| `@firebase/auth` | 105 | 1,8 |
| `react-hook-form` | 74 | 1,3 |
| Código do app (`src/**`) | ≈ 70 | ≈ 1,2 |

O código do app é irrelevante para o tamanho; o peso é de dependências. `reanimated` e `worklets` são exigidos pelo NativeWind/css-interop e pelo gesture-handler — **não acionável**.

### 4.3 Requisições derivadas do código (Firestore/Storage)

| Operação | Chamadas sequenciais | Leituras de documentos |
|---|---|---|
| Login → lista | 1 `getDocs` | n |
| Criar sem comprovante | `addDoc` → refetch | n |
| Criar com comprovante | `addDoc` → upload → `getDownloadURL` → `updateDoc` → refetch | n |
| Editar com troca de comprovante | upload → `getDownloadURL` → `updateDoc` → delete antigo → refetch | n |
| Excluir com comprovante | delete arquivo → `deleteDoc` → refetch | n |

`n` = total de transações do usuário. Não observei duplicidade de requisições, polling ou N+1.

---

## 5. Diagnóstico por página

| Tela | Achados |
|---|---|
| **Root `_layout`** | Retorna `null` até Auth resolver **e** a fonte Ionicons carregar (esperado para esconder a splash). Importa `@/modules/transactions` (índice) estaticamente: PERF-12 (suspeita). 5 providers montados, 4 sem consumidor: PERF-11 |
| **Login / Registro / Recuperar senha** | Sem achados de performance relevantes; custo é o bundle compartilhado (PERF-01/02) |
| **Home** | Spinner de tela inteira até toda a lista carregar, mesmo com o nome do usuário já disponível: PERF-07. Gráficos: PERF-06. Totais calculados em memória a cada mudança da lista (O(n log n), irrelevante em volumes realistas) |
| **Transações** | `FlatList` com 10 itens, cálculo de filtro/paginação memoizado — adequado. Digitar na descrição re-renderiza a tela (estado `draft` na tela), mas são 10 itens; **sem evidência de problema** |
| **Nova/Editar transação** | Salvar espera de 2 a 5 operações sequenciais **e** o refetch completo da lista antes de fechar o modal: PERF-03a/PERF-08. `transaction-form.tsx` é pulado pelo React Compiler (`watch()` do RHF, aviso do lint) — impacto não comprovado, 2 `watch` só re-renderizam quando mudam |
| **Perfil / Editar foto** | Avatar é prefetchado em 3 pontos: PERF-10. Upload de avatar sem redimensionamento além de `quality: 0.8` (não avaliado) |

---

## 6. Diagnóstico de requisições

- **Sem duplicidade de query:** uma única query de transações (`['transactions','list',uid]`) alimenta Home, lista e edição. **Confirmado** (positivo).
- **Cache:** `staleTime` 30 s, mas como o provider fica montado na raiz e `refetchOnWindowFocus` está desligado, a lista só é refeita por mutação ou novo login. Isso é *sub*-busca (ver seção 11), não excesso.
- **Excesso real:** refetch integral após cada mutação (PERF-03a) e ausência de `limit`/`orderBy`/paginação no servidor (PERF-03b).
- **Dados extras:** Home só precisa de totais, mas baixa todos os documentos completos (inclui objeto `receipt` com URL de download assinada).
- **Loading prolongado em erro:** `retry: 2` global faz uma falha (offline, permissão negada) mostrar o spinner por ≈ 3 s de backoff antes de exibir erro (PERF-09).

---

## 7. Diagnóstico de carregamento

| Candidato | Avaliação |
|---|---|
| Gráficos (`lazyWithPreload`) | **Sem ganho de download no nativo** (bundle único); `preloadHomeCharts()` roda no import do módulo, no root layout, no `TabsLayout`, no efeito da Home e no `tabPress` — o adiamento é anulado de propósito. Na web há chunk separado (361 KB), também pré-carregado de imediato |
| Locales de `date-fns` / `zod` | Não é adiamento, é **remoção**: nunca são usados (PERF-01/02) |
| Fontes de ícones | Não são carregadas em runtime (só Ionicons via `useFonts`); o problema é tamanho de assets (PERF-05) |
| Telas de transações/perfil | Já pré-carregadas em idle/`onPressIn`; em nativo isso só antecipa avaliação de módulos |
| Imagens | Avatar com cache em disco OK; comprovantes: PERF-04 |
| Firebase | `@firebase/firestore` completo inclui `re2js` (142 KB) e SDK com listeners; o app usa só get/add/update/delete (+ `subscribeToDocument` sem uso). Alternativa `firebase/firestore/lite` existe mas perde `onSnapshot` e o `experimentalAutoDetectLongPolling` — **não recomendado sem spike** |

---

## 8. Oportunidades de otimização

### PERF-01 — Barrel de locales do `date-fns` entra inteiro no bundle
- **Localização:** `src/utils/format-date.ts:2` (`import { ptBR } from 'date-fns/locale'`); consumidores: `formatDate` em lista, Home e edição.
- **Problema:** o barrel `date-fns/locale` referencia 98 locales; o Metro não faz tree-shaking.
- **Evidência (confirmado):** 896 KB em `date-fns/locale` (15,7% do JS atribuído); `pt-BR` isolado ≈ 10 KB. `date-fns` é usado só em `format`, `formatDistanceToNow` (sem uso real), `startOfDay`, `endOfDay`.
- **Impacto:** −~0,9 MB de JS minificado; menos módulos para carregar/avaliar no startup (**efeito no startup é suspeita**, não medido).
- **Causa provável:** import por barrel.
- **Solução recomendada:** importar `ptBR` do subcaminho `date-fns/locale/pt-BR`. Sem mudança de comportamento.
- **Complexidade:** baixa · **Prioridade:** alta
- **Riscos:** mínimos; confirmar que o subcaminho está exposto em `exports` da versão instalada (4.4.0 — o arquivo existe).
- **Validação:** repetir o export e a atribuição; `date-fns/locale` deve cair para ≈ 10 KB e o bundle JS reduzir ≈ 0,9 MB; conferir datas formatadas em pt-BR nas telas.

### PERF-02 — `zod` inclui todos os locales
- **Localização:** `import { z } from 'zod'` em `config/env.ts`, `validations/common.schema.ts`, `auth.validation.ts`, `transaction.validation.ts`.
- **Evidência (confirmado):** `zod/v4/locales` = 438 KB (7,7%), `v4/core` 219 KB, `classic` 47 KB.
- **Impacto:** até −~0,4 MB de JS.
- **Causa provável:** o entry `zod` reexporta `locales`; o Metro não remove.
- **Solução recomendada:** spike com `zod/mini` ou com um alias/resolver que exclua os locales. **Não sei se `zod/mini` resolve sem reescrever schemas e sem quebrar `@hookform/resolvers`** — precisa ser validado antes de prometer ganho.
- **Complexidade:** média/alta · **Prioridade:** média
- **Riscos:** reescrever schemas (mensagens de erro, `refine`, `z.custom`), compatibilidade com `zodResolver`.
- **Validação:** mesmo export + atribuição; testes manuais de todos os formulários e mensagens de validação.

### PERF-03a — Mutações re-baixam a lista inteira e a UI espera por isso
- **Localização:** `modules/transactions/presentation/context/transactions-context.tsx` (`invalidateTransactionQueries`, chamado com `await` em create/update/delete); `router.back()` nas telas só ocorre depois.
- **Evidência (confirmado no código):** `invalidateQueries({ exact: true })` com `await` retorna após o refetch concluir; `getDocs` sem `limit`.
- **Impacto:** latência para fechar o modal = mutação + download de n documentos; **n leituras faturadas por mutação**.
- **Causa provável:** invalidar é o caminho mais simples de manter consistência.
- **Solução recomendada (avaliar):** (a) não aguardar o refetch antes de navegar; ou (b) atualizar o cache localmente com `setQueryData` (já se conhece o `id` e os valores gravados) e deixar a invalidação em segundo plano.
- **Complexidade:** média · **Prioridade:** alta
- **Riscos:** (b) pode divergir do servidor (timestamps, campos calculados); (a) mostra a lista momentaneamente desatualizada — decisão de UX.
- **Validação:** contar leituras no console do Firestore e tempo "toque em Salvar → modal fechado" antes/depois (n = 50, 500, 2000 documentos).

### PERF-03b — Sem paginação/filtragem/agregação no servidor
- **Localização:** `firebase-transaction.repository.ts: getTransactions`, `firebase/firestore.ts: queryCollection`, `filterTransactions`, `calculateTransactionMetrics`.
- **Evidência:** a coleção inteira é lida a cada login e a cada refetch; filtro e paginação (10 itens) ocorrem em memória.
- **Impacto:** payload, memória e leituras crescem com n; irrelevante para dezenas de documentos, relevante para milhares. **Sem dados reais, o ponto de inflexão é desconhecido.**
- **Solução recomendada (quando o volume justificar):** consultas paginadas com cursor + `orderBy`; totais da Home via agregação do Firestore (`sum`/`count`) ou documento de resumo.
- **Complexidade:** alta · **Prioridade:** média (sobe se o volume crescer)
- **Riscos:** muda a ordenação (hoje a lista segue a ordem de ID do documento, sem `orderBy`); índices compostos; a busca por descrição (`includes`) não é expressável no Firestore; exige atualizar `firestore.rules`/índices.
- **Validação:** leituras por sessão e tempo até a Home exibir totais com bases sintéticas de 100/1k/10k transações.

### PERF-04 — Pré-carregamento de comprovantes sem consumidor
- **Localização:** `presentation/preload-receipts.ts` + efeito em `transactions-context.tsx` (primeiros 10 itens a cada novo `data`); `transaction-list-item.tsx` (`onPressIn` → `preloadImage(receipt.url)`).
- **Evidência (confirmado):** o único componente `Image` do app é `Avatar`; comprovantes são abertos com `WebBrowser.openBrowserAsync` (`receipt-field.tsx`), que não usa o cache do `expo-image`. Comprovantes podem ser PDF (até 5 MB, `RECEIPT_MAX_SIZE_BYTES`).
- **Impacto:** banda e disco desperdiçados logo após o login; teto teórico de 10 × 5 MB; o real depende dos arquivos dos usuários (**não medido**).
- **Causa provável:** pré-carregamento adicionado antes de existir (ou a ser usada) uma pré-visualização inline do comprovante.
- **Solução recomendada:** remover o prefetch de comprovantes enquanto não houver pré-visualização com `expo-image` (e, se houver, restringir a imagens, nunca PDF).
- **Complexidade:** baixa · **Prioridade:** alta
- **Riscos:** nenhum funcional hoje; se o time planeja pré-visualização, reavaliar.
- **Validação:** inspecionar tráfego de rede após o login com contas com comprovantes (Flipper/Proxy): nenhuma requisição a URLs de `firebasestorage` até o usuário abrir um comprovante.

### PERF-05 — 20 fontes de ícones nos assets, 1 usada
- **Localização:** `import { Ionicons } from '@expo/vector-icons'` (11 arquivos, barrel).
- **Evidência (confirmado no export):** 5,04 MB de `.ttf` (ex.: MaterialCommunityIcons 1,3 MB); só `Ionicons.ttf` (390 KB) é usado. Em release, o efeito no tamanho do APK/IPA **não foi verificado**.
- **Impacto:** tamanho de instalação/OTA, não runtime.
- **Solução recomendada:** spike com import por família (`@expo/vector-icons/Ionicons`) e conferir se os demais `.ttf` saem do export.
- **Complexidade:** baixa · **Prioridade:** média
- **Riscos:** mudar 11 imports; se não eliminar as fontes, nenhum ganho.
- **Validação:** `expo export` e tamanho do artefato de release antes/depois.

### PERF-06 — Lazy loading dos gráficos sem efeito no nativo
- **Localização:** `home-screen.tsx` (`lazyWithPreload`, `void preloadHomeCharts()` no import), `app/(tabs)/_layout.tsx`, `app/_layout.tsx`.
- **Evidência (confirmado):** Android gera um único `.hbc`; na web há chunk de 361 KB, pré-carregado imediatamente. `ChartSkeleton` usa alturas fixas (`h-44`) que podem diferir dos gráficos reais (**salto de layout não medido**).
- **Impacto:** baixo; complexidade desnecessária e possível salto visual skeleton → gráfico.
- **Solução recomendada:** **não expandir** esse padrão. Opcionalmente consolidar as 5 chamadas de preload em uma só e conferir as alturas do skeleton. Não remover sem medir TTI/jank da primeira visita à Home.
- **Complexidade:** baixa · **Prioridade:** baixa · **Riscos:** regressão de percepção na troca de aba.
- **Validação:** gravação de tela/Perfetto da primeira abertura da Home.

### PERF-07 — Home bloqueia a tela inteira até carregar tudo
- **Localização:** `home-screen.tsx` (`isPending` → `<Loading />` único).
- **Evidência:** saudação e nome vêm do `AuthContext`, já disponíveis; só os números dependem da lista.
- **Impacto:** percepção de lentidão proporcional ao tempo do `getDocs`.
- **Solução recomendada:** renderizar a estrutura e usar skeleton só nos valores (padrão já usado em `ChartSkeleton`).
- **Complexidade:** baixa · **Prioridade:** média · **Riscos:** altera a aparência do carregamento (decisão de design).
- **Validação:** tempo até primeiro conteúdo útil em rede lenta (throttling).

### PERF-08 — Operações sequenciais nas mutações com comprovante
- **Localização:** `application/transaction.use-cases.ts` (criar: `addDoc` → upload → `updateDoc`; editar: upload → `updateDoc` → apagar antigo), seguido do refetch.
- **Evidência:** 4–5 idas e voltas em série (seção 4.3). A remoção do comprovante antigo e o refetch poderiam ocorrer em paralelo.
- **Impacto:** tempo de "Salvar" com anexo, sensível à latência móvel.
- **Solução recomendada:** paralelizar apenas o que é independente (apagar o arquivo antigo; refetch). Gerar o ID do documento antes (`doc()` local) permitiria subir o arquivo em paralelo à criação — avaliar.
- **Complexidade:** média · **Prioridade:** média
- **Riscos:** consistência: hoje falhas deixam no máximo um arquivo órfão (tolerado); paralelizar pode aumentar o caso "documento sem comprovante" ou "comprovante sem documento".
- **Validação:** cronometrar "Salvar" com anexo de 1 MB em 4G simulado.

### PERF-09 — Retry de leitura com backoff em erros não transitórios
- **Localização:** `services/query-client.ts` (`retry: 2`).
- **Evidência:** erros como `permission-denied` não melhoram com retry; o spinner permanece ≈ 3 s (1 s + 2 s) antes do erro.
- **Solução:** `retry` condicional (não repetir erros de permissão). **Complexidade:** baixa · **Prioridade:** baixa · **Riscos:** menos tolerância a falhas intermitentes. **Validação:** simular regra negando leitura e medir tempo até a mensagem de erro.

### PERF-10 — Preloads redundantes
- **Localização:** avatar em `auth-context.tsx` (`Image.prefetch`), `TabsLayout` (idle e `tabPress`); `preloadHomeCharts` em 5 pontos.
- **Evidência:** chamadas repetidas à mesma URL/módulo; o `lazyWithPreload` memoiza e `Avatar` já usa cache em disco, então o custo é baixo.
- **Impacto:** ruído e manutenção, não performance mensurável. **Prioridade:** baixa · **Complexidade:** baixa.

### PERF-11 — Providers montados sem consumidor
- **Localização:** `Theme`, `Connectivity`, `Notification`, `App` em `app/_layout.tsx`.
- **Evidência (confirmado):** nenhum `useThemeContext`, `useConnectivityContext`/`useNetworkStatus`, `useNotificationContext`, `useAppContext` em uso. Custo: 2 leituras do AsyncStorage + 1 listener do NetInfo no startup.
- **Impacto:** desprezível. Estão documentados como base arquitetural — recomendação é **manter**, a menos que o profiling de startup mostre peso. **Prioridade:** baixa.

### PERF-12 — Grafo de imports eager no startup *(suspeita)*
- **Localização:** `app/_layout.tsx` importa `TransactionsProvider` do índice de `@/modules/transactions`, que reexporta telas, formulário (RHF, zod, document-picker, web-browser).
- **Hipótese:** isso aumenta o trabalho de carga antes da primeira tela. Com `inlineRequires` do Metro pode ser mitigado — **não verificado**.
- **Validação necessária:** marcar o tempo do início do JS até o primeiro render (Hermes sampling profiler / `adb shell am start -W`) antes de qualquer mudança. **Prioridade:** a definir após medição.

---

## 9. Matriz de priorização

| ID | Problema | Localização | Impacto | Complexidade | Prioridade | Confiança |
|---|---|---|---|---|---|---|
| PERF-01 | Locales do `date-fns` no bundle | `utils/format-date.ts` | −0,9 MB JS | Baixa | **Alta** | Confirmado |
| PERF-03a | Refetch integral + espera na mutação | `transactions-context.tsx` | Latência e leituras por salvar | Média | **Alta** | Confirmado (código) |
| PERF-04 | Prefetch de comprovantes sem uso | `preload-receipts.ts`, list item | Banda/disco pós-login | Baixa | **Alta** | Confirmado (código) |
| PERF-02 | Locales do `zod` no bundle | schemas e `env.ts` | −~0,4 MB JS | Média/Alta | Média | Confirmado (tamanho) / solução a validar |
| PERF-03b | Sem paginação/agregação no servidor | repositório, `queryCollection` | Escala com n | Alta | Média | Derivado |
| PERF-05 | Fontes de ícones não usadas | imports de `@expo/vector-icons` | −~4,6 MB de assets | Baixa | Média | Confirmado (export) |
| PERF-07 | Home bloqueada por spinner | `home-screen.tsx` | Percepção de carregamento | Baixa | Média | Derivado |
| PERF-08 | Mutações sequenciais | `transaction.use-cases.ts` | Tempo de salvar com anexo | Média | Média | Derivado |
| PERF-12 | Imports eager no startup | `app/_layout.tsx` | Startup | A medir | A definir | Suspeita |
| PERF-06 | Lazy de gráficos ineficaz no nativo | `home-screen.tsx` | Baixo | Baixa | Baixa | Confirmado |
| PERF-09 | Retry em erro não transitório | `query-client.ts` | ≈ 3 s de spinner em erro | Baixa | Baixa | Derivado |
| PERF-10 | Preloads redundantes | auth-context, TabsLayout | Desprezível | Baixa | Baixa | Confirmado |
| PERF-11 | Providers sem consumidor | `app/_layout.tsx` | Desprezível | Baixa | Baixa | Confirmado |

---

## 10. Plano de otimização recomendado

0. **Linha de base (antes de tudo):** registrar bundle (este relatório), tamanho de release e medir em dispositivo real de gama média: tempo de cold start, tempo até a Home com dados, tempo de "Salvar" com e sem anexo, leituras Firestore por sessão. Sem isso PERF-07/08/12 não têm como ser comprovados.
1. **PERF-01** — ganho confirmado, mudança de uma linha, risco mínimo.
2. **PERF-04** — remover trabalho sem consumidor; verificar no tráfego de rede.
3. **PERF-03a** — melhor ganho percebido; decidir antes a estratégia (não aguardar refetch vs. atualização local).
4. **PERF-05** e **PERF-02** — como *spikes* com critério de aborto se não houver redução medida.
5. **PERF-07** e **PERF-08** — melhorias de percepção/latência, após a linha de base.
6. **PERF-03b** — somente se o volume real de transações justificar; exige decisão de produto (ordenação, busca) e índices.
7. **PERF-12** — decidir depois do profiling de startup.
8. PERF-06/09/10/11: manter sob observação; não priorizar.

Não recomendo, com base nos dados: `useMemo`/`useCallback` adicionais (React Compiler ativo e nenhuma re-renderização comprovada), nem mais lazy loading no nativo (bundle único).

---

## 11. Critérios de validação (antes × depois)

| Métrica | Como medir | Meta/observação |
|---|---|---|
| Tamanho do bundle JS e `.hbc` | `npx expo export --platform android [--no-bytecode] --dump-sourcemap` + atribuição por pacote | PERF-01: `date-fns/locale` ≈ 10 KB; total ≈ −0,9 MB JS |
| Tamanho de assets / release | `expo export` e artefato APK/AAB/IPA | PERF-05: remoção dos `.ttf` não usados |
| Cold start e TTI (Home) | Hermes sampling profiler / `adb shell am start -W` / Perfetto, 10 execuções, mediana, mesmo dispositivo | Comparar com a linha de base |
| Tempo de salvar | Cronometrar do toque em "Salvar" até o modal fechar; n = 50/500/2000; com e sem anexo | PERF-03a/08 |
| Leituras e requisições | Console do Firestore (Usage), proxy de rede | PERF-03a/04: leituras por mutação e requisições a Storage no login |
| Jank/CLS | Gravação de tela, Perfetto | PERF-06/07 |
| Regressão funcional | Fluxos: login, registro, criar/editar/excluir transação com e sem comprovante, filtros, paginação, troca de avatar, datas em pt-BR | Sem mudança de comportamento |

---

## 12. Observações fora do escopo de performance (não verificadas)

- A lista de transações **não é ordenada** (ordem de ID do documento), embora a Home ordene as "recentes" por data.
- Como os dados só são refeitos após mutação, alterações feitas em outro dispositivo só aparecem após novo login (o `onlineManager` do React Query não está ligado ao NetInfo). É *staleness*, não excesso de rede.
- `AuthContext.refreshUser` devolve o mesmo objeto `currentUser` do Firebase; se o React Query/estado não re-renderizar por referência igual, a foto de perfil pode não atualizar imediatamente. **Não reproduzi** — registrado apenas como ponto a conferir.
- As alterações da refatoração de Clean Architecture (tarefa anterior) continuam não commitadas na branch `refactor/clean-architecture`; a auditoria foi feita sobre esse estado, e nenhum comportamento mudou entre elas para os achados acima.
