# Componentes — Lastro (Currency Exchange App)

> **Versão inicial (cartão 2)**, feita a partir do Figma (`docs/FIGMA.md`, página `03 · Componentes & Tokens`) e de `branding/wireframes/wireframes.md`. Ela deve ser atualizada nos cartões 4 (componentização), 5 (props) e 6 (estado), quando o código existir.

**Convenções:** JavaScript (`.jsx`), componentes funcionais, um CSS Module por componente (`Nome.module.css`) e tokens de `src/styles/tokens.css` (cópia de `branding/tokens.css`) como variáveis CSS globais. Padrões repetidos (container, rótulo em caixa alta, título de seção, painel) ficam em `src/styles/shared.module.css` e são reaproveitados com `composes`. Ícones: Lucide React. Gráfico: Recharts.

### Situação atual (cartão 4)

A interface estática foi dividida em componentes, cada um em `src/components/Nome/Nome.jsx` com seu `Nome.module.css`:

| Seção | Componentes criados |
|---|---|
| Estrutura | `Header`, `Hero`, `Footer` (o `App` só monta a página) |
| Conversor | `Converter`, `AmountInput`, `CurrencySelect` (usado 2×), `SwapButton`, `ConversionResult`, `RateInfo` |
| Histórico | `HistorySection`, `PeriodSelector`, `HistoryChart` (Recharts a partir do cartão 12) |
| Dados | `DataSection`, `TableFilters`, `DataTable` (inclui a paginação), `ExportCsvButton` |

**Simplificação em relação ao mapa inicial:** `RateDateBadge`, `PeriodSummary` e `ResultCount` eram pequenos demais para virar componentes separados. O selo da data ficou dentro de `RateInfo`, o resumo do período dentro de `HistorySection` e a contagem de registros dentro de `DataSection`.

### Situação atual (cartão 5)

Os dados fictícios saíram dos componentes e agora descem do `App` por props:

| Arquivo | Conteúdo |
|---|---|
| `src/mocks/mockData.js` | `currencies`, `latestRate` e `history` (22 dias úteis), no mesmo formato das respostas da API v2 |
| `src/constants/periods.js` | Os 8 períodos (`key`, `label`, `longLabel`, `unit`, `amount`) |
| `src/constants/defaults.js` | Par padrão EUR → BRL, valor 1, período 30D e 10 linhas por página |

| Componente | Props recebidas |
|---|---|
| `Hero` | `rateDate` |
| `Converter` | `base`, `quote`, `currencies`, `rate`, `rateDate` |
| `AmountInput` | `value` |
| `CurrencySelect` | `id`, `label`, `currency` (objeto `{ code, name }` achado com `find`) |
| `ConversionResult` | `value` (calculado como `amount × rate`), `currency` |
| `RateInfo` | `base`, `quote`, `rate`, `date` |
| `HistorySection` | `base`, `quote`, `period`, `periods`, `records` |
| `PeriodSelector` | `options`, `value` (botões gerados com `map`) |
| `HistoryChart` | `records`, `pair` (pontos, grade e eixos gerados com `map`) |
| `DataSection` | `base`, `quote`, `records` |
| `TableFilters` | `dateBounds`, `rateBounds` (campos gerados com `map`) |
| `DataTable` | `records`, `pair`, `pageSize` (linhas geradas com `map`) |

O resumo do período (variação, mínima e máxima), os limites dos filtros e a contagem são derivados dos `records` durante a renderização, sem estado.

### Situação atual (cartão 6)

A interface responde ao usuário com `useState` e eventos:

| Estado | Dono | Atualizado por | Efeito |
|---|---|---|---|
| `base`, `quote` | `App` | `onBaseChange`, `onQuoteChange`, `onSwap` (vindos de `CurrencySelect` e `SwapButton`) | Conversor, histórico e tabela trocam de par juntos |
| `period` | `App` | `onPeriodChange` (vindo de `PeriodSelector`) | Gráfico, resumo e tabela trocam de período |
| `amountText` | `Converter` | `onChange` do `AmountInput` | Resultado recalculado; erro inline quando inválido (RN02) |
| `open`, `query`, `activeIndex` | `CurrencySelect` | clique, digitação e setas ↑ ↓ / Enter / Esc | Popover pesquisável de moedas |

**Lifting state up:** o par e o período sobem para o `App` porque três seções dependem deles. Os filhos não alteram nada direto: chamam o callback recebido por props e o `App` atualiza o estado.

**Regras aplicadas:** RN03 (escolher a mesma moeda do outro lado inverte o par), RN04 (inverter mantém o valor digitado) e RN02 (validação do valor, com "—" no resultado quando inválido).

Os dados continuam fictícios: `getMockRate(base, quote)` calcula a taxa cruzada de qualquer par e `getMockHistory(base, quote, period)` gera os dias úteis do período. A API real entra no cartão 9.

Ficam para depois: `LanguageSelect`, `ThemeToggle`, `OnboardingCard`, `KpiCard`, `OfflineBanner` e `Toast`, que são opcionais (`PLANEJAMENTO.md` §4.1), e `Loading`, `ErrorMessage`, `EmptyState` e `Mascot`, que dependem de estado real (cartões 10 e 15).

### Situação atual (cartões 9 e 10)

Os dados vêm da API Frankfurter (`services/frankfurterApi.js`). O `App` tem um `useEffect` por consulta, e cada um roda só quando as suas dependências mudam:

| Consulta | Dependências | Não roda quando muda |
|---|---|---|
| `getCurrencies()` | tentativa (`retry`) | par, período, valor |
| `getLatestRate(base, quote)` | `base`, `quote`, tentativa | período, valor |
| `getHistory(base, quote, period)` | `base`, `quote`, `period`, tentativa | valor |

O valor digitado nunca dispara requisição: a conversão é só `valor × taxa` (RN01).

**Status derivado, sem estado extra.** Cada resultado guarda a `key` da requisição que respondeu (ex.: `EUR/BRL/30D#0`). Se a key atual ainda não tem resultado, o status é `'loading'`. Depois é `'error'` ou `'success'`.

**Cancelamento.** O cleanup do efeito chama `controller.abort()`. Se o usuário troca de par antes da resposta chegar, a requisição antiga é cancelada e não sobrescreve a nova. O `AbortError` é ignorado, porque não é um erro para o usuário.

**Tentar de novo.** Soma 1 na tentativa daquela consulta. A key muda e o efeito roda de novo.

| Componente novo | Responsabilidade | Props |
|---|---|---|
| `Splash` | Tela inteira enquanto a lista de moedas carrega. Se der erro, mostra o Ouri e "Tentar de novo" | `status`, `onRetry` |
| `StatusMessage` | Mensagem de vazio ou erro de uma seção, com Ouri e botão opcionais | `message`, `mascot`, `actionLabel`, `onAction`, `actionVariant`, `framed` |

Estados por seção (iguais ao `LastroApp.dc.html`):

| Seção | Carregando | Erro | Vazio |
|---|---|---|---|
| Tela inicial | Ouri "carregando" + "Buscando cotações…" | Ouri "erro" + "Tentar de novo" | — |
| Conversor | skeleton no resultado | alerta vermelho "Não consegui atualizar a cotação." + "Tentar de novo"; resultado "—" | — |
| Histórico | skeleton com a forma de uma curva | Ouri "erro" + "Tentar de novo" | Ouri "vazio" + "Não há cotações publicadas neste período." |
| Dados | tabela skeleton com 5 linhas | mensagem sem Ouri | mensagem sem Ouri |

**Regra do mascote:** no máximo um Ouri por tela. O histórico e a tabela vêm da mesma requisição, então o Ouri aparece só no histórico.

Os seletores de período e de moeda continuam funcionando durante o carregamento e os erros.

### Situação atual (cartão 11)

Os 3 `useEffect` do `App` faziam a mesma coisa: buscar, guardar o resultado, cancelar e tentar de novo. Essa lógica foi para um **custom hook genérico** e três hooks específicos, em `src/hooks/`:

| Hook | Recebe | Key da requisição | Usado por |
|---|---|---|---|
| `useApiRequest(key, request)` | uma key e uma função `request(signal)` que devolve Promise | a key recebida + a tentativa | os 3 hooks abaixo |
| `useCurrencies()` | — | `currencies` | `App` → `Splash`, `CurrencySelect` |
| `useLatestRate(base, quote)` | o par | `EUR/BRL` | `App` → `Converter`, `Hero` |
| `useHistory(base, quote, period)` | o par e o período | `EUR/BRL/30D` | `App` → `HistorySection`, `DataSection` |

Todos devolvem o mesmo formato: `{ status, data, error, retry }`, com `status` igual a `'loading' | 'error' | 'success'`.

Como o `useApiRequest` funciona:
- **A key decide quando buscar.** O efeito depende só da key. Por isso cada hook monta a key com tudo o que a requisição usa (par, período). Um novo render sem mudança de key não busca nada.
- **`useEffectEvent` (React 19.2).** A função `request` é recriada a cada render. O Effect Event chama sempre a versão mais nova sem entrar nas dependências, então o efeito não roda à toa e o lint (`react-hooks/exhaustive-deps`) fica sem avisos.
- **Cancelamento.** O cleanup chama `abort()`, e qualquer resposta de uma requisição cancelada é descartada. Isso vale até quando a resposta já tinha chegado (caso achado no teste com o StrictMode).
- **`retry`.** Soma uma tentativa só naquele hook. "Tentar de novo" no histórico busca só o histórico, e não a cotação nem as moedas. Conferido no navegador.

O `App` ficou só com o estado da interface (`base`, `quote`, `period`) e a ligação entre as seções.

### Situação atual (cartão 12)

O SVG feito à mão do `HistoryChart` foi trocado pelo **Recharts** (`AreaChart`), seguindo o gráfico do design (`LastroApp`, `buildChart`):

| Item | Como ficou |
|---|---|
| Linha e área | `Area` linear, linha `secondary` de 2px, área com 8% de opacidade, sem animação |
| Eixo Y | 4 marcas da mínima à máxima, 20% de folga em cima e embaixo. Casas decimais conforme a variação (`utils/chart.js`) |
| Eixo X | 5 datas (3 no mobile), a primeira alinhada à esquerda e a última à direita. "23 de out" nos períodos curtos e "out de 25" acima de 140 registros |
| Grade | Só as linhas horizontais das marcas do eixo Y (`syncWithTicks`) |
| Mínima e máxima | `ReferenceDot` com "mín. 5,58" em vermelho embaixo e "máx. 6,25" em verde em cima. Perto das bordas o texto alinha para dentro |
| Último ponto | A "moedinha" (`gold-400` com borda `gold-700`) |
| Tooltip | Linha tracejada e card com a data por extenso e a cotação com 4 casas + código da moeda. Funciona com mouse, toque e teclado (setas, `accessibilityLayer` do Recharts) |
| Tamanho | 320px de altura no desktop e 240px abaixo de 640px (`hooks/useMediaQuery.js`, com `useSyncExternalStore`) |
| Acessibilidade | `figure` com `aria-label` descrevendo período, primeira e última cotação, mínima e máxima |

O gráfico muda quando o par ou o período muda, porque os `records` vêm do `useHistory`. Isso foi conferido no navegador com 30D, 10A e o par invertido.

**Carregamento sob demanda.** O Recharts era a maior parte do JS (641 kB em um arquivo só). O `HistoryChart` agora é carregado com `React.lazy` + `Suspense`, e o skeleton do histórico ocupa o lugar enquanto o arquivo chega. O JS inicial caiu para 261 kB (83 kB gzip), e o gráfico vem num arquivo separado de 380 kB.

## 1. Árvore de componentes

```
App
├─ Header ─ Logo · LanguageSelect · ThemeToggle
├─ Hero ─ SourceBadge · OnboardingCard (Mascot welcome)
├─ Converter
│  ├─ AmountInput
│  ├─ CurrencySelect (De) · SwapButton · CurrencySelect (Para)
│  ├─ ConversionResult
│  └─ RateInfo ─ RateDateBadge
├─ HistorySection
│  ├─ PeriodSelector
│  ├─ PeriodSummary ─ KpiCard ×4
│  └─ HistoryChart
├─ DataSection
│  ├─ TableFilters (desktop: barra · mobile: bottom sheet) ─ ResultCount
│  ├─ DataTable (desktop: tabela · mobile: RecordCard)
│  └─ ExportCsvButton
├─ Footer
└─ Toast (Mascot success)

Estados reutilizados pelas seções: Loading (Skeleton) · ErrorMessage · EmptyState · OfflineBanner · Mascot
```

## 2. Onde fica o estado (lifting state up)

| Estado | Dono | Por que está aí | Quem recebe por props |
|---|---|---|---|
| `base`, `quote` (par de moedas) | `App` | Conversor, histórico e tabela usam o mesmo par | `Converter`, `HistorySection`, `DataSection` |
| `period` (padrão `30D`) | `App` | O histórico e a tabela vêm da mesma consulta | `HistorySection` (`PeriodSelector`), `DataSection` |
| `history` (registros do período) | `App`, via `useHistory(base, quote, period)` | Uma única fonte para o gráfico, os KPIs e a tabela (cartão 13) | `HistorySection`, `DataSection` |
| `amount` | `Converter` | Só o conversor usa | `AmountInput`, `ConversionResult` |
| `latestRate` | `Converter`, via `useLatestRate(base, quote)` | Só o conversor usa | `ConversionResult`, `RateInfo` |
| `filters`, `sort`, `page` | `DataSection` | Só a tabela e o CSV usam | `TableFilters`, `DataTable`, `ExportCsvButton` |
| `locale`, `theme` | `App` (salvos em `localStorage`) | Afetam toda a interface | `Header` e formatadores |
| `onboardingSeen` | `Hero` (`localStorage`) | Card de 1º acesso | `OnboardingCard` |

**Derivado durante a renderização, sem estado próprio:** o valor convertido (`amount × rate`), o resumo do período (última, variação, mínima e máxima), os registros filtrados e ordenados, a contagem e o nome do CSV.

## 3. Componentes

### Estrutura

| Componente | Responsabilidade | Arquivos | Props principais | Estado interno | Figma |
|---|---|---|---|---|---|
| `App` | Guarda o estado compartilhado e monta as seções | `src/App.jsx` · `App.module.css` | — | `base`, `quote`, `period`, `locale`, `theme` | Telas da página 02 |
| `Header` | Logo, âncoras das seções, idioma e tema. Fixo no topo com 64px | `components/Header/Header.jsx` · `.module.css` | `locale`, `onLocaleChange`, `theme`, `onThemeToggle` | — | `Header Desktop`, `Header Mobile` |
| `Hero` | H1, subtítulo, badge da fonte e card de 1º acesso | `components/Hero/Hero.jsx` · `.module.css` | `rateDate` | `onboardingSeen` | Hero (MF Desktop/Mobile) |
| `OnboardingCard` | Ouri welcome, 1 frase e botão "Entendi". Não é modal | `components/OnboardingCard/…` | `onDismiss` | — | Card de 1º acesso |
| `Footer` | Créditos da fonte e links | `components/Footer/…` | — | — | Footer |

### Conversor `[C]`

| Componente | Responsabilidade | Arquivos | Props principais | Estado interno | Figma |
|---|---|---|---|---|---|
| `Converter` | Junta as entradas, busca a taxa e calcula o resultado | `components/Converter/Converter.jsx` · `.module.css` | `base`, `quote`, `currencies`, `onBaseChange`, `onQuoteChange`, `onSwap` | `amount`, `latestRate` (hook) | Card "Conversor" |
| `AmountInput` | Campo de valor com `inputmode="decimal"`. Aceita vírgula ou ponto e mostra erro inline (≤ 0, mais de 2 casas, acima de 1 bilhão) | `components/AmountInput/…` | `value`, `onChange`, `error`, `locale` | texto digitado (rascunho) | `Field/Amount` (Default/Error) |
| `CurrencySelect` | Combobox pesquisável com a lista de `/currencies`. No mobile abre em tela cheia | `components/CurrencySelect/…` | `label`, `value`, `options`, `onChange`, `disabledCode` | `open`, `query` | `Currency Select` · tela "Seletor de moeda" |
| `SwapButton` | Inverte a origem e o destino. Circular, 44px, `aria-label="Inverter moedas"` | `components/SwapButton/…` | `onClick`, `disabled` | — | `Swap` |
| `ConversionResult` | Valor convertido em 40px com números tabulares e código ISO. Mostra "—" quando a moeda é a mesma ou o valor é inválido | `components/ConversionResult/…` | `value`, `currency`, `loading` | — | Bloco "Resultado" |
| `RateInfo` | "1 EUR = 5,4321 BRL · 1 BRL = 0,1841 EUR" | `components/RateInfo/…` | `base`, `quote`, `rate` | — | Linha da taxa |
| `RateDateBadge` | Data efetiva da cotação. Explica no tooltip quando ela é diferente de hoje (fim de semana ou feriado) | `components/RateDateBadge/…` | `date`, `isLatest` | — | `Source Badge` (variante info) |

### Histórico `[G]`

| Componente | Responsabilidade | Arquivos | Props principais | Estado interno | Figma |
|---|---|---|---|---|---|
| `HistorySection` | Título "Histórico {BASE}/{QUOTE}", períodos, resumo e gráfico. Mostra loading, erro ou vazio | `components/HistorySection/…` | `base`, `quote`, `period`, `onPeriodChange`, `history`, `status`, `onRetry` | — | Card "Histórico" |
| `PeriodSelector` | Controle segmentado com 8 opções (7D, 15D, 30D, 3M, 6M, 1A, 5A, 10A) e `aria-pressed`. No mobile rola na horizontal | `components/PeriodSelector/…` | `value`, `options`, `onChange` | — | `Period Chip` |
| `PeriodSummary` | Texto-resumo (que também serve de alternativa acessível ao gráfico) e 4 KPIs | `components/PeriodSummary/…` | `records` | — | Texto + `KPI` ×4 |
| `KpiCard` | Rótulo, valor e data. A variação usa `up`/`down` com seta | `components/KpiCard/…` | `label`, `value`, `hint`, `trend` | — | `KPI` |
| `HistoryChart` | Linha `secondary` de 2px, área com 8%, grid horizontal e tooltip. Mínima e máxima em `down`/`up`. O último ponto é a mini-moeda (8px `gold-400`, borda `gold-700`, sem rosto). Altura de 320 no desktop e 240 no mobile | `components/HistoryChart/…` | `records`, `locale` | — | Gráfico (MF) |

### Dados `[D]`

| Componente | Responsabilidade | Arquivos | Props principais | Estado interno | Figma |
|---|---|---|---|---|---|
| `DataSection` | Aplica os filtros e a ordenação sobre o `history` e entrega o resultado à tabela e ao CSV | `components/DataSection/…` | `history`, `base`, `quote`, `status`, `onRetry` | `filters`, `sort`, `page` | Card "Dados do período" |
| `TableFilters` | De/Até e cotação mín./máx., combináveis. Valida início ≤ fim e mín ≤ máx. Botão "Limpar filtros" quando há filtro ativo. No mobile vira bottom sheet com a ordenação | `components/TableFilters/…` | `filters`, `onChange`, `onClear`, `dateBounds`, `sort`, `onSortChange` | rascunho do sheet (mobile) | `Filter Field` · tela "Filtros (bottom sheet)" |
| `ResultCount` | "{n} de {total} registros" com `aria-live="polite"` | `components/ResultCount/…` | `count`, `total`, `activeFilters` | — | Texto de contagem |
| `DataTable` | Colunas Data · De · Para · Cotação (4 casas, alinhada à direita). Cabeçalho clicável para ordenar, com `aria-sort`. 50 linhas por página no desktop e "Carregar mais" no mobile | `components/DataTable/…` | `records`, `sort`, `onSortChange`, `page`, `onPageChange` | — | `Table Header`, `Table Row`, `Record Card` |
| `ExportCsvButton` | Gera o CSV no navegador com os registros filtrados e ordenados e cabeçalhos traduzidos. Fica desabilitado com 0 registros. Nome: `lastro_{BASE}-{QUOTE}_{inicio}_{fim}.csv` | `components/ExportCsvButton/…` | `records`, `base`, `quote`, `range`, `onExported` | — | `Button` Primary/Disabled |

### Estados e feedback

| Componente | Responsabilidade | Arquivos | Props principais | Figma |
|---|---|---|---|---|
| `Loading` | Skeleton no formato final de cada seção (`aria-busy`). Na carga inicial, splash com o Ouri loading de 180px | `components/Loading/…` | `variant` (`splash` · `section`), `lines` | `Skeleton` · Splash |
| `ErrorMessage` | Mensagem e "Tentar de novo". Inline no conversor e em bloco nas seções | `components/ErrorMessage/…` | `message`, `onRetry`, `inline`, `showMascot` | Estados "Erro de API" |
| `EmptyState` | Filtros sem resultado ou período sem cotações, com "Limpar filtros" quando cabe | `components/EmptyState/…` | `title`, `description`, `action`, `showMascot` | Estados "Ausência de dados" |
| `OfflineBanner` | Banner fixo no topo com a última cotação carregada (opcional) | `components/OfflineBanner/…` | `lastDate` | Estado "Offline" |
| `Toast` | "Pronto! {n} registros exportados." Some em 4 s e pausa no hover ou no foco | `components/Toast/…` | `message`, `onClose`, `duration` | `Toast` |
| `Mascot` | O Ouri em SVG, decorativo (`aria-hidden`). Poses: welcome, loading, error, empty, offline e success | `components/Mascot/…` | `pose`, `size` | `Ouri` (component set) |

**Regra do mascote:** no máximo um Ouri por tela. Quem decide é o `App`, que passa `showMascot` só para a primeira seção com erro ou vazio. O Ouri nunca aparece sobre o gráfico, a tabela ou os valores (`brand-guide.md §4`).

## 4. Hooks, serviços e utilitários

| Arquivo | Responsabilidade | Usado por |
|---|---|---|
| `services/frankfurterApi.js` | `getCurrencies()`, `getLatestRate(base, quote)`, `getHistory(base, quote, period)` com `fetch` e `async/await`; erros viram `ApiError` | hooks |
| `hooks/useApiRequest.js` | Busca genérica: status, cancelamento (`AbortController`) e `retry` | hooks abaixo |
| `hooks/useCurrencies.js` | Lista de moedas | `App` → `Splash`, `CurrencySelect` |
| `hooks/useLatestRate.js` | Taxa e data efetiva do par | `App` → `Converter`, `Hero` |
| `hooks/useHistory.js` | Registros do período | `App` → `HistorySection`, `DataSection` |
| `hooks/useMediaQuery.js` | `true` enquanto a media query vale (tamanho do gráfico no mobile) | `HistoryChart` |
| `utils/amount.js` | Validação do valor (RN02) | `Converter` |
| `utils/conversion.js` | `convert`, `invertRate`, `selectCurrency`, `swapPair` | `Converter`, `RateInfo`, `App` |
| `utils/dates.js` | `getPeriodRange` e datas em ISO | `services` |
| `utils/records.js` | Filtro, validação dos filtros, ordenação, paginação e resumo | `DataTable`, seções |
| `utils/format.js` | `formatRate`, `formatMoney`, `formatDate`… em pt-BR | vários |
| `utils/csv.js` | `toCsv`, `getCsvFileName` | `ExportCsvButton` (cartão 14) |
| `utils/chart.js` | Mínima/máxima, eixo Y (domínio, marcas, casas), datas do eixo X, alinhamento dos rótulos | `HistoryChart` |
| `constants/` | Os 8 períodos, o par padrão (EUR → BRL) e o tamanho da página | vários |

Os testes de tudo isso estão em `docs/FUNCTION_TESTS.md`.

## 5. Fluxo de dados

```
useCurrencies() ──► App ──► CurrencySelect (options)
useLatestRate(base, quote) ──► App ──► Converter ──► ConversionResult · RateInfo
useHistory(base, quote, period) ──► App ──► history
                                              ├─► HistorySection ─► PeriodSummary · HistoryChart
                                              └─► DataSection ─► filter + sort ─► DataTable · ResultCount · ExportCsvButton
Eventos sobem por callback: onBaseChange · onQuoteChange · onSwap · onPeriodChange · onRetry
```
