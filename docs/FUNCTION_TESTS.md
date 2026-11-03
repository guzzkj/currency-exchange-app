# Testes das funções JavaScript

Cartão 8: as regras de negócio saíram dos componentes e foram para funções puras em `src/utils/`. Puras quer dizer que recebem dados, devolvem dados e não mexem em estado, DOM ou API. Assim dá para testar cada regra sozinha, sem abrir o navegador.

> Este documento será completado no cartão 15 com os testes de tela (API real, loading, erro, responsividade).

## Como rodar

```bash
npm test
```

Usa o **test runner nativo do Node** (`node:test` + `node:assert`), sem nenhuma dependência extra. Os arquivos de teste ficam ao lado das funções (`*.test.js`).

### Resultado (03/11/2026)

| Arquivos | Testes | Passaram | Falharam |
|---|---|---|---|
| 8 | 59 | 59 | 0 |

> Cartão 8: 47 testes (6 arquivos de `utils/`). Cartão 9: +8 testes do `services/frankfurterApi.js`. Cartão 11: +4 testes de `hooks/useApiRequest.js`.

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
| `records.js` | `filterRecords(records, filters)` | Filtra por data e cotação; campo vazio não filtra | RN10 |
| | `validateFilters(filters)` | Início ≤ fim, mín. ≤ máx., número válido | RN10 |
| | `sortRecords(records, sort)` | Ordena por data ou cotação, sem alterar o original | RN09 |
| | `paginate(records, page, size)` | Página atual, total de páginas, "Mostrando X–Y" | — |
| | `getRateStats(records)` | Primeira, última, mín., máx. e variação do período | — |
| `csv.js` | `toCsv(records)` | CSV com BOM, `;`, `data;origem;destino;cotacao` | RN13 |
| | `getCsvFileName(base, quote, records)` | `cotacoes_EUR-BRL_{início}_{fim}.csv`, ou `null` sem registros | RN14, RN15 |

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
| `HistoryChart` | `formatNumber`, `formatRate`, `formatShortDate` |
| `DataSection` | `getRateStats` |
| `DataTable` | `sortRecords`, `paginate`, `formatDate`, `formatRate` |
| `TableFilters` | `formatRate` |
| `services/frankfurterApi.js` | `getPeriodRange`, `addDays` |

Ainda não usadas na tela: `filterRecords`, `validateFilters` (cartão 13), `toCsv` e `getCsvFileName` (cartão 14).
