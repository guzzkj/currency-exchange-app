# Testes das funções JavaScript

Cartão 8: as regras de negócio saíram dos componentes e foram para funções puras em `src/utils/`. Puras quer dizer que recebem dados, devolvem dados e não mexem em estado, DOM ou API. Assim dá para testar cada regra sozinha, sem abrir o navegador.

> Os testes de tela (API real, loading, erro, responsividade) estão em [Testes finais na tela](#testes-finais-na-tela-cartão-15).

## Como rodar

```bash
npm test
```

Usa o **test runner nativo do Node** (`node:test` + `node:assert`), sem nenhuma dependência extra. Os arquivos de teste ficam ao lado das funções (`*.test.js`).

### Resultado (03/11/2026)

| Arquivos | Testes | Passaram | Falharam |
|---|---|---|---|
| 9 | 72 | 72 | 0 |

> Cartão 8: 47 testes (6 arquivos de `utils/`). Cartão 9: +8 testes do `services/frankfurterApi.js`. Cartão 11: +4 testes de `hooks/useApiRequest.js`. Cartão 12: +6 testes de `utils/chart.js` e +3 de `utils/format.js`. Cartão 13: +4 testes de `utils/records.js`. Cartão 14: sem função nova (o botão usa `toCsv` e `getCsvFileName`, já testadas), conferido no navegador.

Também rodei com o fuso do computador trocado (`TZ=Pacific/Kiritimati`, UTC+14, e `TZ=America/Los_Angeles`, UTC−8), e os 47 testes de `utils/` passaram. Isso garante que nenhuma data "pula" um dia por causa do fuso.

## Funções

| Arquivo | Função | O que faz | Regra |
|---|---|---|---|
| `amount.js` | `parseAmount(text)` | Valida o valor digitado e devolve `{ value, error }` | RN02 |
| | `parseDecimal(text)` | Lê número com vírgula ou ponto (usado nos filtros) | RN10 |
| `conversion.js` | `convert(amount, rate)` | `valor × taxa`, ou `null` sem valor/taxa | RN01 |
| | `invertRate(rate)` | Taxa inversa (`1 / rate`) | — |
| | `selectCurrency(pair, side, code)` | Troca uma moeda e inverte o par se repetir | RN03 |
| | `swapPair(pair)` | Inverte origem e destino | RN04 |
| `dates.js` | `getPeriodRange(key, today)` | Data inicial e final de cada um dos 8 períodos | RN07 |
| | `subtractMonths(iso, n)` | Volta meses ajustando o fim do mês | RN07 |
| | `isWeekend`, `getBusinessDays` | Dias úteis | RN08 |
| | `isValidIsoDate(iso)` | Recusa datas mal formadas ou inexistentes | RN10 |
| `format.js` | `formatRate`, `formatMoney` | 4 casas para cotação, 2 para dinheiro, pt-BR | RN12 |
| | `formatDate`, `formatShortDate`, `formatWeekday` | Datas em pt-BR sem erro de fuso | RN06 |
| | `formatChange(percent)` | `+1,23% ▲` / `−0,45% ▼` | — |
| | `formatAxisDate`, `formatLongDate`, `formatCompactRate` | Datas do eixo e do tooltip, rótulos de mín./máx. do gráfico | RN12 |
| `records.js` | `filterRecords(records, filters)` | Filtra por data e cotação; campo vazio não filtra | RN10 |
| | `validateFilters(filters)` | Início ≤ fim, mín. ≤ máx., número válido | RN10 |
| | `getEffectiveFilters(filters)` | Filtros aplicados: o par inválido é ignorado | RN10 |
| | `countActiveFilters(filters)` | Quantos campos estão preenchidos | — |
| | `toggleSort(sort, key)` | Clique no cabeçalho: inverte ou começa decrescente | RN09 |
| | `sortRecords(records, sort)` | Ordena por data ou cotação, sem alterar o original | RN09 |
| | `paginate(records, page, size)` | Página atual, total de páginas, "Mostrando X–Y" | — |
| | `getRateStats(records)` | Primeira, última, mín., máx. e variação do período | — |
| `csv.js` | `toCsv(records)` | CSV com BOM, `;`, `data;origem;destino;cotacao` | RN13 |
| | `getCsvFileName(base, quote, records)` | `cotacoes_EUR-BRL_{início}_{fim}.csv`, ou `null` sem registros | RN14, RN15 |
| `chart.js` | `getExtremes(records)` | Mínima e máxima com a posição | — |
| | `getYAxis(records)` | Domínio com 20% de folga, 4 marcas, casas decimais | — |
| | `getXTicks(records, count)` | Datas do eixo X, sempre com a primeira e a última | — |
| | `getEdgeAnchor(index, total)` | Alinhamento do rótulo perto das bordas | — |

## Casos testados

Legenda: ✅ passou.

### Valor digitado — `parseAmount` (RN02)

| Entrada | Esperado | Obtido |
|---|---|---|
| `10,5` | `10.5` | ✅ |
| `10.50` | `10.5` | ✅ |
| `  1  ` (espaços) | `1` | ✅ |
| `1.000` | `1000` (milhar pt-BR) | ✅ |
| `1.000,50` | `1000.5` | ✅ |
| `1.234.567,89` | `1234567.89` | ✅ |
| `1000000000` | aceito (limite) | ✅ |
| `0,01` | `0.01` | ✅ |
| vazio / só espaços | "Digite um valor para converter." | ✅ |
| `-5`, `0`, `0,00` | "Digite um valor maior que zero." | ✅ |
| `abc`, `1e5` | "Use apenas números, com vírgula ou ponto nos centavos." | ✅ |
| `10,999` | "Use no máximo 2 casas decimais." | ✅ |
| `1000000001` | "O valor máximo é 1.000.000.000." | ✅ |
| qualquer entrada com erro | `value` = `null` (resultado mostra "—") | ✅ |

### Conversão e par de moedas (RN01, RN03, RN04)

| Cenário | Entrada | Esperado | Obtido |
|---|---|---|---|
| Conversão | `convert(100, 5.4321)` | `543.21` | ✅ |
| Conversão de 1 | `convert(1, 5.4321)` | `5.4321` | ✅ |
| Sem valor válido | `convert(null, 5.4321)` | `null` | ✅ |
| Taxa ainda não carregada | `convert(10, undefined)` | `null` | ✅ |
| Taxa inversa | `invertRate(4)` | `0.25` | ✅ |
| Taxa zero | `invertRate(0)` | `null` (sem divisão por zero) | ✅ |
| Trocar origem | EUR/BRL, origem → USD | USD/BRL | ✅ |
| Trocar destino | EUR/BRL, destino → USD | EUR/USD | ✅ |
| Origem = destino | EUR/BRL, origem → BRL | BRL/EUR (inverte) | ✅ |
| Destino = origem | EUR/BRL, destino → EUR | BRL/EUR (inverte) | ✅ |
| Não altera o original | `selectCurrency(pair, …)` | `pair` continua EUR/BRL | ✅ |
| Inverter | `swapPair(EUR/BRL)` | BRL/EUR | ✅ |
| Inverter duas vezes | `swapPair(swapPair(EUR/BRL))` | EUR/BRL | ✅ |

### Períodos e datas (RN07, RN08)

`getPeriodRange` com hoje = `2026-11-03`:

| Período | Data inicial esperada | Obtido |
|---|---|---|
| 7D | 2026-10-27 | ✅ |
| 15D | 2026-10-19 | ✅ |
| 30D | 2026-10-04 | ✅ |
| 3M | 2026-08-03 | ✅ |
| 6M | 2026-05-03 | ✅ |
| 1A | 2025-11-03 | ✅ |
| 5A | 2021-11-03 | ✅ |
| 10A | 2016-11-03 | ✅ |
| período inexistente (`2S`) | erro `Unknown period` | ✅ |

| Cenário | Entrada | Esperado | Obtido |
|---|---|---|---|
| Fim do mês | `subtractMonths('2026-05-31', 3)` | `2026-02-28` (e não 03/03) | ✅ |
| Fim do mês em ano bissexto | `subtractMonths('2024-05-31', 3)` | `2024-02-29` | ✅ |
| 29/02 menos 1 ano | `subtractMonths('2024-02-29', 12)` | `2023-02-28` | ✅ |
| Virada de mês | `addDays('2026-10-31', 1)` | `2026-11-01` | ✅ |
| Virada de ano | `addDays('2026-01-01', -1)` | `2025-12-31` | ✅ |
| Sábado / domingo | `isWeekend('2024-05-04')`, `('2024-05-05')` | `true` | ✅ |
| Dias úteis | `getBusinessDays('2024-05-03', '2024-05-07')` | 03, 06, 07 | ✅ |
| Só fim de semana | `getBusinessDays('2024-05-04', '2024-05-05')` | `[]` | ✅ |
| Data válida | `isValidIsoDate('2024-02-29')` | `true` | ✅ |
| Dia inexistente | `isValidIsoDate('2023-02-29')` | `false` | ✅ |
| Mês 13 | `isValidIsoDate('2024-13-01')` | `false` | ✅ (ver bug abaixo) |
| Formato errado | `isValidIsoDate('01/05/2024')` | `false` | ✅ |

### Formatação (RN12)

| Entrada | Esperado | Obtido |
|---|---|---|
| `formatRate(5.4321)` | `5,4321` | ✅ |
| `formatRate(1)` | `1,0000` | ✅ |
| `formatRate(0.18409)` | `0,1841` (arredonda) | ✅ |
| `formatMoney(1234567.891)` | `1.234.567,89` | ✅ |
| `formatMoney(0.005)` | `0,01` | ✅ |
| `formatChange(1.234)` | `+1,23% ▲` | ✅ |
| `formatChange(-0.456)` | `−0,46% ▼` | ✅ |
| `formatDate('2026-10-23')` | `23/10/2026` | ✅ |
| `formatShortDate('2026-10-23')` | `23/10` | ✅ |
| `formatWeekday('2026-10-23')` | `sex.` | ✅ |
| `formatAxisDate('2026-10-23', false)` | `23 de out` | ✅ |
| `formatAxisDate('2026-10-23', true)` | `out de 26` | ✅ |
| `formatLongDate('2026-10-30')` | `Sexta-feira, 30 de outubro de 2026` | ✅ |
| `formatCompactRate(6.0993)` / `(0.16394)` | `6,10` / `0,1639` | ✅ |

### Tabela: filtros, ordenação e paginação (RN09, RN10)

Base de teste: 5 registros EUR/BRL de 19 a 23/10/2026, com cotações 5,40 · 5,45 · 5,38 · 5,45 · 5,50.

| Cenário | Filtro / ação | Esperado | Obtido |
|---|---|---|---|
| Sem filtro | todos os campos vazios | 5 registros | ✅ |
| Data inicial | De = 21/10 | 21, 22, 23 | ✅ |
| Data final | Até = 20/10 | 19, 20 | ✅ |
| Cotação mínima (vírgula) | mín. = `5,45` | 20, 22, 23 | ✅ |
| Cotação máxima (ponto) | máx. = `5.40` | 19, 21 | ✅ |
| Filtros combinados | 20 a 22/10, entre 5,4 e 5,45 | 20, 22 | ✅ |
| Nenhum resultado | mín. = `9` | `[]` | ✅ |
| Validação ok | vazio, ou início = fim e mín. = máx. | sem erros | ✅ |
| Datas invertidas | De 23/10, Até 19/10 | erro no campo "Até" | ✅ |
| Cotações invertidas | mín. 5,5, máx. 5,4 | erro no campo "máx." | ✅ |
| Cotação não numérica | mín. = `abc` | erro no campo "mín." | ✅ |
| Ordenação padrão | data decrescente | 23, 22, 21, 20, 19 | ✅ |
| Data crescente | `{ key: 'date', direction: 'asc' }` | 19 → 23 | ✅ |
| Cotação crescente | empate pela data mais recente | 21, 19, 22, 20, 23 | ✅ |
| Cotação decrescente | | 23, 22, 20, 19, 21 | ✅ |
| Não altera o original | `sortRecords` | array de entrada intacto | ✅ |
| Página 1 de 3 (2 por página) | `paginate(records, 1, 2)` | 2 itens, "1–2" | ✅ |
| Última página | `paginate(records, 3, 2)` | 1 item, "5–5" | ✅ |
| Página fora do limite | página 99 / página 0 | vai para 3 / 1 | ✅ |
| Lista vazia | `paginate([], 1, 10)` | 0 itens, 1 página, "0–0" | ✅ |
| Resumo do período | `getRateStats` | mín. 5,38, máx. 5,50, variação +1,85% | ✅ |
| Resumo sem registros | `getRateStats([])` | `null` | ✅ |
| Datas invertidas são ignoradas | De 23/10, Até 19/10, mín. 5 | aplica só mín. 5 | ✅ |
| Cotações invertidas são ignoradas | mín. 5,5, máx. 5,4 | aplica nenhuma das duas | ✅ |
| Máxima não numérica | mín. 5, máx. `abc` | aplica só mín. 5 | ✅ |
| Filtros válidos | os 4 preenchidos | aplica todos | ✅ |
| Só um lado preenchido | só mín. ou só máx. | sem erro de intervalo | ✅ |
| Contador | vazio / 2 campos | 0 / 2 | ✅ |
| `toggleSort` | data desc → data; data asc → data; data → cotação | asc; desc; cotação desc | ✅ |

**No navegador** (Chrome headless via DevTools Protocol, API real, EUR/BRL):

| Cenário | Resultado |
|---|---|
| Inicial (30D) | "21 registros no período", Data ▼ `descending`, "Mostrando 1–21 de 21" |
| Clique em Cotação / de novo / em Data | ▼ maior primeiro (6,2523) / ▲ menor primeiro (5,5819) / volta Data ▼ |
| mín. = 5,65 | "1 filtro ativo · 10 de 21", todas as linhas ≥ 5,65, "Limpar filtros" aparece |
| + De = 27/10 | "2 filtros ativos · 5 de 21" |
| Até 01/10 (antes do De) | Erro "A data final precisa ser igual ou posterior à inicial.", `aria-invalid`, datas ignoradas (10 de 21) |
| máx. 1 (menor que a mín.) | Erro na máxima, cotações ignoradas (21 de 21) |
| mín. = 99 | Mensagem de sem resultado com Ouri e "Limpar filtros", que volta para 21 |
| 10A | "Mostrando 1–50 de 2558". Próxima: "51–100", "2/52". Ordenar volta à página 1 |
| Trocar para 1A na página 2 | Página 1 de novo ("1–50 de 255"), ordem mantida |
| Mobile: lista | 50 cards, "Carregar mais" → 100, `select` "Cotação (menor)" volta para 50 e ordena |
| Mobile: sheet | Abre com o foco no X. O filtro muda o contador e "Ver 0 registros"/"Filtros (1)". Radio de ordem sincronizado com o `select`. Esc fecha e devolve o foco para "Filtros" |
| Console | Nenhum erro ou aviso |

### CSV (RN13, RN14, RN15)

| Cenário | Esperado | Obtido |
|---|---|---|
| Primeiro caractere | BOM UTF-8 (`U+FEFF`) | ✅ |
| Cabeçalho | `data;origem;destino;cotacao` | ✅ |
| Linha | `2026-10-22;EUR;BRL;5,4321` | ✅ |
| Casas da cotação | `5.5` → `5,5000` | ✅ |
| Ordem | mesma ordem da tabela | ✅ |
| Sem registros | só o cabeçalho | ✅ |
| Nome do arquivo | `cotacoes_EUR-BRL_2026-10-22_2026-10-23.csv` | ✅ |
| Nome com tabela em ordem decrescente | mesmo nome (usa a menor e a maior data) | ✅ |
| Nome sem registros | `null`, o botão fica desabilitado (RN15) | ✅ |

**No navegador** (cartão 14, Chrome headless via DevTools Protocol, API real, EUR/BRL, arquivo baixado lido do disco):

| Cenário | Resultado |
|---|---|
| Exportar com 30D | `cotacoes_EUR-BRL_2026-10-05_2026-11-03.csv`, começa com BOM, cabeçalho + 22 linhas (= tabela) |
| mín. 5,66 + Cotação ▲ | "10 de 22" → arquivo com 10 linhas, **na mesma ordem da tabela**, nome com o intervalo dos registros filtrados (`2026-10-15_2026-11-03`) |
| 0 registros (desktop) | `aria-disabled="true"`, tooltip "Não há registros para exportar." no foco/hover (ligado por `aria-describedby`), Esc esconde, clique não baixa nada |
| Mobile | Barra fixa no fim da seção, "Exportar CSV (22)" em largura total, baixa o mesmo arquivo. Com 0: "Exportar CSV (0)" + texto embaixo |
| Console | Nenhum erro ou aviso |

> A cotação no CSV usa **vírgula** decimal. Com separador `;`, o Excel em pt-BR reconhece `5,4321` como número. Com ponto, ele trataria o valor como texto.

### Camada da API — `services/frankfurterApi.js` (cartão 9)

Os testes trocam o `fetch` por um falso, que devolve a resposta escolhida e guarda a URL chamada. Assim eles rodam sem internet e testam também os casos de erro, que são difíceis de provocar na API real.

| Cenário | Esperado | Obtido |
|---|---|---|
| `getLatestRate('EUR', 'BRL')` | chama `/v2/rate/EUR/BRL?providers=ECB` e devolve `{ date, base, quote, rate }` | ✅ |
| `getHistory('EUR', 'BRL', '30D')` com hoje = 03/11/2026 | chama `/v2/rates?from=2026-10-04&to=2026-11-03&base=EUR&quotes=BRL&providers=ECB` | ✅ |
| API devolve a cotação de antes do início (02/10) | registro removido; a tabela não mostra data fora do período | ✅ |
| Histórico vazio (`[]`) | devolve `[]` sem erro | ✅ |
| `getCurrencies()` | nomes em pt-BR (`Real brasileiro`), ordem alfabética, sem moedas extintas (ARS) | ✅ |
| HTTP 422 `invalid currency: XYZ` | `ApiError` com `status` 422 e a mensagem da API | ✅ |
| HTTP 503 sem corpo JSON | `ApiError` com "Erro 503 na API." | ✅ |
| Sem internet (`fetch` rejeita) | `ApiError` com `status` 0 e "Não foi possível conectar à API." | ✅ |
| Requisição cancelada (`AbortError`) | continua `AbortError`; não vira mensagem de erro (usado no cartão 10) | ✅ |

**Teste contra a API real (03/11/2026)**, com um script rodando as funções no Node:

| Chamada | Resultado |
|---|---|
| `getCurrencies()` | 30 moedas ativas no BCE (AUD … ZAR) |
| `getLatestRate('EUR', 'BRL')` | `{ date: '2026-11-02', rate: 6.099 }`. Em 03/11 o BCE ainda não tinha publicado, então a data efetiva é 02/11 (RN06) |
| `getHistory('EUR', 'BRL', '7D')` | 5 registros, de 27/10 a 02/11 |
| `getHistory('EUR', 'BRL', '30D')` | 21 registros, de 05/10 a 02/11 |
| `getHistory('EUR', 'BRL', '10A')` | 2.558 registros, de 03/11/2016 a 02/11/2026 |
| `getLatestRate('EUR', 'XYZ')` | `ApiError 422 invalid currency: XYZ` |

### Status das requisições — `getStatus` em `hooks/useApiRequest.js` (cartão 11)

| Cenário | Esperado | Obtido |
|---|---|---|
| Ainda sem resultado | `loading` | ✅ |
| Resultado é do par antigo (`EUR/BRL#0`, par atual `BRL/EUR#0`) | `loading`, e a taxa antiga não é usada | ✅ |
| Depois de "Tentar de novo" (`#0` → `#1`) | `loading` | ✅ |
| Resultado da requisição atual | `success` ou `error` | ✅ |

**No navegador** (Chrome headless com `fetch` interceptado): o histórico falha (500), aparece "Tentar de novo", o clique busca **só** `/rates` de novo, e o gráfico com 21 registros aparece. A cotação e as moedas não foram buscadas outra vez.

### Gráfico — `utils/chart.js` (cartão 12)

| Cenário | Esperado | Obtido |
|---|---|---|
| `getExtremes` com mínimo repetido | primeira ocorrência (posição 1) | ✅ |
| `getAxisDecimals(0.01 / 0.3 / 1 / 20 / 500)` | 4 / 3 / 2 / 1 / 0 casas | ✅ |
| `getYAxis` de 6,0 a 6,3 | domínio 5,94–6,36, marcas 6,0 … 6,3, 3 casas | ✅ |
| `getYAxis` com taxa constante | domínio não vazio e uma marca só | ✅ |
| `getXTicks(5 registros, 3)` | primeira, do meio e última data | ✅ |
| `getXTicks(2 registros, 5)` | sem datas repetidas | ✅ |
| `getEdgeAnchor` no início / meio / fim | `start` / `middle` / `end` | ✅ |

**No navegador** (Chrome headless via DevTools Protocol, API real):

| Cenário | Resultado |
|---|---|
| 30D no desktop (1280px) | Gráfico 1150×320, rótulos "mín. 5,58" e "máx. 6,25", moedinha no último ponto |
| Mouse a 60% da largura | Tooltip "Quarta-feira, 21 de outubro de 2026 · 5,6432 BRL" e linha tracejada |
| Mobile (390px) | Gráfico 332×240, 3 datas no eixo X |
| Período 10A | 2.558 pontos, eixo X "nov de 16 … nov de 26" |
| Teclado (foco + seta →) | Tooltip do primeiro dia (04/11/2016) |
| Inverter o par | Gráfico redesenhado como BRL/EUR (0,1438 a 0,3086) |
| Console | Nenhum erro ou aviso |

## Testes finais na tela (cartão 15)

Os 15 testes mínimos da seção 9 do briefing rodam num **Chrome de verdade**, com a **API real**, pelo roteiro `scripts/validate-scenarios.mjs`. Ele controla o Chrome pelo DevTools Protocol (sem dependência nova). Falha, demora e período vazio da API são **simulados** interceptando só aquelas requisições.

```bash
npm run build
npm run preview -- --port 4173 --strictPort   # em outro terminal
npm run test:scenarios
```

Cada verificação aparece como ✅ ou ❌ no terminal, e o comando sai com erro se alguma falhar. Os prints vão para `docs/img/tests/` e o resultado completo para `docs/img/tests/results.json`.

### Resultado (03/11/2026, EUR/BRL)

**96/96 verificações ok.**

| # | Cenário | Passos | Esperado | Obtido | Evidência |
|---|---|---|---|---|---|
| 1 | Conversão entre duas moedas | Digitar 100 e depois 1.234,56 com EUR → BRL | Resultado = valor × cotação da API, linha com cotação direta e inversa | ✅ 3/3 | [01-conversao](img/tests/01-conversao.png) |
| 2 | Inversão das moedas | Clicar em Inverter moedas | Par BRL → EUR, valor 100 mantido (RN04), resultado com a cotação BRL/EUR, histórico acompanha | ✅ 4/4 | [02-inversao](img/tests/02-inversao.png) |
| 3 | Atualização dos dados ao alterar o par | Abrir "Para", buscar USD, escolher. Depois escolher USD em "De" | Conversor, título do histórico e tabela passam a EUR/USD. Escolher a moeda do outro lado inverte o par (RN03) | ✅ 5/5 | [03-troca-de-par](img/tests/03-troca-de-par.png) |
| 4 | Todos os períodos históricos (os 8) | Clicar em cada período, de 7D a 10A | Cada período traz registros, 7D sem fim de semana (RN08), mais período = mais registros | ✅ 10/10 | [04-periodo-10a](img/tests/04-periodo-10a.png) |
| 5 | Gráfico com dados reais | Abrir 30D, passar o mouse no gráfico | Linha desenhada, marcas mín./máx. iguais à tabela, descrição para leitor de tela, tooltip | ✅ 5/5 | [05-grafico](img/tests/05-grafico.png) |
| 6 | Tabela com dados reais | Abrir 30D | Uma linha por registro, colunas Data · De · Para · Cotação, cotação com 4 casas | ✅ 3/3 | [06-tabela](img/tests/06-tabela.png) |
| 7 | Filtros individuais e combinados | Usar cada filtro sozinho, depois data + cotação, depois Limpar | Todas as linhas respeitam os filtros, contador atualiza, Limpar volta ao total | ✅ 6/6 | [07-filtros](img/tests/07-filtros.png) |
| 8 | Ordenação | Clicar nos cabeçalhos Cotação e Data | Padrão data mais recente (RN09), cotação ▼/▲, data ▲ | ✅ 4/4 | [08-ordenacao](img/tests/08-ordenacao.png) |
| 9 | Exportação CSV | Filtrar por cotação mín., exportar. Depois filtrar sem resultado | Arquivo com BOM, cabeçalho e exatamente as linhas da tabela, na mesma ordem. Nome `cotacoes_EUR-BRL_{início}_{fim}.csv`. Com 0: botão desabilitado + motivo (RN15) | ✅ 5/5 | [09-csv-desabilitado](img/tests/09-csv-desabilitado.png) |
| 10 | Entradas inválidas | Valor vazio, 0, -5, abc, 1,2,3. Filtros invertidos | Mensagem, `aria-invalid`, resultado "—". Filtro inválido mostra erro e é ignorado | ✅ 8/8 | [10-valor-invalido](img/tests/10-valor-invalido.png) · [10-filtro-invalido](img/tests/10-filtro-invalido.png) |
| 11 | Ausência de dados | Filtro sem resultado. Período com lista vazia da API (simulado) | Mensagem + Ouri + Limpar. "Não há cotações publicadas neste período.", exportar desabilitado, um Ouri por tela | ✅ 4/4 | [11-sem-resultado-filtro](img/tests/11-sem-resultado-filtro.png) · [11-periodo-vazio](img/tests/11-periodo-vazio.png) |
| 12 | Falha na API | Simular 500 em /currencies, /rate e /rates, e 422 em /rates | Tela de erro ou alerta por parte, com "Tentar de novo" que recupera. O resto do app continua funcionando | ✅ 9/9 | [12-falha-moedas](img/tests/12-falha-moedas.png) · [12-falha-cotacao](img/tests/12-falha-cotacao.png) · [12-falha-historico](img/tests/12-falha-historico.png) |
| 13 | Estados de loading | Segurar as respostas da API (simulado) | Splash "Buscando cotações…", depois skeletons e `aria-busy` no resultado, histórico e tabela. Exportar desabilitado | ✅ 5/5 | [13-loading-splash](img/tests/13-loading-splash.png) · [13-loading-skeletons](img/tests/13-loading-skeletons.png) |
| 14 | Responsividade em desktop e celular | Abrir em 1280, 1024, 768, 390 e 320px. Clicar nos links do menu | Sem rolagem horizontal, os 8 períodos visíveis, alvos ≥ 24px, tabela no desktop e cards no mobile, sheet com foco no X, menu não esconde a seção | ✅ 24/24 | [14-desktop-1280](img/tests/14-desktop-1280.png) · [14-mobile-390-conversor](img/tests/14-mobile-390-conversor.png) · [14-mobile-390-historico](img/tests/14-mobile-390-historico.png) · [14-mobile-390-dados](img/tests/14-mobile-390-dados.png) · [14-mobile-390-filtros](img/tests/14-mobile-390-filtros.png) · [14-mobile-320](img/tests/14-mobile-320.png) |
| 15 | Console sem erros | Todos os cenários acima | Nenhum erro ou aviso no console | ✅ 1/1 | — |
| — | Instalação a partir do README | `npm install` + `npm run dev` seguindo só o README | App abre | Cartão 16 | — |

Números reais desta rodada: 100 EUR = 614,11 BRL (cotação 6,1411). Períodos: 7D 6 · 15D 12 · 30D 22 · 3M 67 · 6M 132 · 1A 256 · 5A 1281 · 10A 2559 registros. CSV filtrado: 11 linhas, iguais às 11 da tabela.

### Corrigido no cartão 15

- **10A escondido no celular.** O seletor de período rolava de lado com a barra de rolagem escondida, então o 10A ficava fora da tela sem nenhuma pista. Agora os 8 botões dividem a largura (34px cada em 320px, 44px de altura).
- **Menu escondia o topo da seção.** O header é `sticky`, e o clique em Conversor/Histórico/Dados levava o topo da seção para baixo dele. O mesmo valia para o foco do teclado (WCAG 2.4.11). Correção: `scroll-padding-top` no `html`. O roteiro confere que a seção fica 16px abaixo do header.
- **Ordem cortada no celular.** O botão "Filtros" ocupava metade da barra, e o `select` mostrava "Cotação (meno". Agora o botão tem a largura do texto e o `select` fica com o resto. Em 390px cabe "Data (mais recente)". Em 320px o texto mais longo ainda termina em reticências.

## Bugs encontrados pelos testes

`isValidIsoDate('2024-13-01')` **lançava uma exceção** (`RangeError: Invalid time value`) em vez de devolver `false`. O mês 13 gera uma data inválida, e o `toISOString()` falha com ela.

Correção: checar `Number.isNaN(date.getTime())` antes de comparar. Sem esse teste, o erro só apareceria quando alguém digitasse uma data impossível no filtro.

**Resposta de requisição cancelada gravada (cartão 11).** No teste do "Tentar de novo", o `fetch` falso respondia na hora, antes do cancelamento. Assim, o erro de uma requisição já cancelada (o StrictMode roda o efeito duas vezes) ainda era gravado. Correção: antes de gravar, o hook confere `controller.signal.aborted` e descarta a resposta.

## Onde as funções são usadas

| Componente | Funções |
|---|---|
| `App` | `selectCurrency`, `swapPair` |
| `Converter` | `parseAmount`, `convert` |
| `ConversionResult` | `formatMoney` |
| `RateInfo` | `invertRate`, `formatRate`, `formatDate`, `formatWeekday` |
| `Hero` | `formatDate` |
| `HistorySection` | `getRateStats`, `formatChange`, `formatRate` |
| `HistoryChart` | `getYAxis`, `getXTicks`, `getExtremes`, `getEdgeAnchor`, `formatNumber`, `formatRate`, `formatDate`, `formatAxisDate`, `formatLongDate`, `formatCompactRate` |
| `DataSection` | `getRateStats`, `validateFilters`, `getEffectiveFilters`, `filterRecords`, `sortRecords`, `countActiveFilters`, `toggleSort` |
| `DataTable` | `paginate`, `formatDate`, `formatRate` |
| `DataList` | `formatDate`, `formatRate` |
| `ExportCsvButton` | `toCsv`, `getCsvFileName` |
| `TableFilters` | `formatCompactRate` |
| `services/frankfurterApi.js` | `getPeriodRange`, `addDays` |

Todas as funções de `utils/` já são usadas na tela.
