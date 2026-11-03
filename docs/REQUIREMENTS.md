# Requisitos — Lastro (Currency Exchange App)

> Cartão 1 do board: **Entender o problema e definir os requisitos**.
> Fonte: briefing `[Projeto 01] Currency Exchange App`. Este documento transforma o briefing em requisitos, regras de negócio e critérios de aceite antes de qualquer código.

## 1. Contexto

Uma empresa de tecnologia financeira quer oferecer uma ferramenta para consultar taxas de câmbio, converter valores e analisar o histórico de moedas.

Hoje os usuários consultam sites diferentes, fazem conversões manualmente e copiam os dados para planilhas. A proposta é reunir esse processo em uma **Single Page Application em React** que consome a **API Frankfurter** (dados de referência publicados pelo Banco Central Europeu e outros bancos centrais).

## 2. Público-alvo

| Perfil | Necessidade principal |
|---|---|
| Pessoa que viaja ou compra no exterior | Converter um valor rapidamente e saber a data da cotação |
| Analista financeiro / controller | Acompanhar a variação histórica de um par e levar os dados para planilha |
| Estudante / pesquisador | Consultar séries históricas longas (até 10 anos) e exportar |

Uso em **desktop e celular**, sem cadastro.

## 3. Objetivo

Permitir que o usuário, em uma única tela:

1. selecione duas moedas;
2. informe um valor e veja a conversão;
3. consulte a taxa usada e a data efetiva da cotação;
4. acompanhe a evolução histórica do par;
5. altere o período de análise;
6. veja os dados em gráfico e tabela;
7. filtre e ordene os registros;
8. exporte os registros filtrados em CSV.

## 4. Escopo

### 4.1 Dentro do escopo

- Conversor de moedas (origem, destino, valor, resultado, taxa, data, inversão, validação).
- Histórico do par com 8 períodos: 7 dias, 15 dias, 30 dias, 3 meses, 6 meses, 1 ano, 5 anos e 10 anos.
- Gráfico do histórico.
- Tabela com data, moeda de origem, moeda de destino e cotação.
- Filtros por intervalo de datas e por cotação mínima/máxima, combináveis e limpáveis.
- Ordenação por data e por cotação.
- Contador de registros encontrados.
- Exportação CSV dos registros filtrados.
- Estados de loading, erro e ausência de dados.
- Layout responsivo (desktop e mobile).

### 4.2 Fora do escopo

Autenticação, cadastro de usuários, back-end próprio, banco de dados, pagamentos e compra ou venda real de moedas.

## 5. Requisitos funcionais

### Conversor

| ID | Requisito |
|---|---|
| RF01 | O sistema deve listar as moedas disponíveis obtidas da API para seleção de origem e destino. |
| RF02 | O usuário deve poder selecionar a moeda de origem. |
| RF03 | O usuário deve poder selecionar a moeda de destino. |
| RF04 | O usuário deve poder informar um valor a converter. |
| RF05 | O sistema deve exibir o valor convertido, calculado pela aplicação a partir da taxa obtida. |
| RF06 | O sistema deve exibir a taxa usada (1 origem = X destino) e a data efetiva da cotação. |
| RF07 | O usuário deve poder inverter origem e destino com um botão. |
| RF08 | O sistema deve validar o valor informado e mostrar mensagem de erro em entradas inválidas. |

### Histórico e gráfico

| ID | Requisito |
|---|---|
| RF09 | O usuário deve poder escolher um dos 8 períodos: 7d, 15d, 30d, 3m, 6m, 1a, 5a, 10a. |
| RF10 | O sistema deve buscar o histórico do par selecionado no período escolhido. |
| RF11 | O sistema deve exibir o histórico em gráfico de linha (data × cotação). |
| RF12 | O gráfico deve atualizar quando o par de moedas ou o período mudar. |

### Tabela de dados

| ID | Requisito |
|---|---|
| RF13 | O sistema deve exibir uma tabela com data, moeda de origem, moeda de destino e cotação. |
| RF14 | A tabela deve usar os mesmos dados do histórico exibido no gráfico. |
| RF15 | O usuário deve poder filtrar por intervalo de datas (data inicial e final). |
| RF16 | O usuário deve poder filtrar por cotação mínima e máxima. |
| RF17 | Os filtros devem poder ser combinados. |
| RF18 | O usuário deve poder limpar todos os filtros de uma vez. |
| RF19 | O usuário deve poder ordenar por data (crescente/decrescente). |
| RF20 | O usuário deve poder ordenar por cotação (crescente/decrescente). |
| RF21 | O sistema deve exibir a quantidade de registros encontrados após os filtros. |

### Exportação CSV

| ID | Requisito |
|---|---|
| RF22 | O usuário deve poder exportar em CSV apenas os registros resultantes dos filtros, na ordem exibida. |
| RF23 | O CSV deve conter linha de cabeçalho. |
| RF24 | O arquivo deve ser gerado no navegador, sem servidor. |
| RF25 | O sistema deve impedir a exportação quando não houver registros. |
| RF26 | O arquivo deve ter nome identificável com par e intervalo. |

### Estados da interface

| ID | Requisito |
|---|---|
| RF27 | O sistema deve exibir indicador de carregamento enquanto consulta a API. |
| RF28 | O sistema deve exibir mensagem de erro amigável quando a API falhar, com opção de tentar novamente. |
| RF29 | O sistema deve exibir estado vazio quando não houver dados (período sem cotações ou filtros sem resultado). |

## 6. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF01 | SPA em React com componentes funcionais e JSX, criada e empacotada com Vite. |
| RNF02 | Linguagem JavaScript (`.jsx`/`.js`). |
| RNF03 | Estilos isolados com CSS Modules (`*.module.css`). |
| RNF04 | Consumo da API com `fetch` e `async/await`, isolado em `src/services/`. |
| RNF05 | Pelo menos um custom hook reutilizável em `src/hooks/`. |
| RNF06 | Lógica de negócio (conversão, períodos, filtros, ordenação, formatação, CSV) em funções puras em `src/utils/`. |
| RNF07 | Gráfico com biblioteca (Recharts). Ícones com Lucide React. |
| RNF08 | Layout responsivo a partir de 360 px de largura até desktop 1440 px. |
| RNF09 | Acessibilidade básica: campos com `label`, navegação por teclado, foco visível, contraste AA. |
| RNF10 | Não refazer consultas à API se par e período não mudaram (efeitos com dependências corretas). |
| RNF11 | Instalação e execução apenas com `npm install` e `npm run dev`, conforme README. |
| RNF12 | Versionamento com Git/GitHub, branches `main` e `dev`, commits pequenos e semânticos. |

## 7. Regras de negócio

| ID | Regra |
|---|---|
| RN01 | Valor convertido = valor informado × taxa (origem → destino). A API fornece só a taxa; a conta é da aplicação. |
| RN02 | O valor deve ser numérico, maior que zero, com no máximo 2 casas decimais e no máximo 1.000.000.000. Aceita vírgula ou ponto como separador decimal. |
| RN03 | Moeda de origem e destino não podem ser iguais. Se o usuário escolher a mesma, o sistema troca as moedas. |
| RN04 | Inverter troca origem e destino e mantém o valor informado. A nova taxa é recalculada. |
| RN05 | Par padrão ao abrir: EUR → BRL, valor 1, período 30 dias. |
| RN06 | A data exibida é a **data efetiva** retornada pela API, não a data de hoje. Em fins de semana e feriados a API devolve a última cotação publicada. |
| RN07 | Intervalo do período: data final = hoje; data inicial = hoje menos o período (7, 15 ou 30 dias; 3 ou 6 meses; 1, 5 ou 10 anos). |
| RN08 | Datas sem cotação publicada não aparecem no gráfico nem na tabela (não são interpoladas). |
| RN09 | Ao mudar par ou período, os filtros da tabela são limpos e a ordenação volta ao padrão (data decrescente). |
| RN10 | No filtro de datas, a data inicial não pode ser maior que a final. No filtro de cotação, a mínima não pode ser maior que a máxima. Campos vazios não filtram. |
| RN11 | Os filtros de data ficam limitados ao intervalo do período carregado. |
| RN12 | Cotações exibidas com 4 casas decimais; valores monetários com 2 casas, no formato do idioma (pt-BR). |
| RN13 | CSV: separador `;`, codificação UTF-8 com BOM (abre corretamente no Excel), colunas `data;origem;destino;cotacao`, datas em `AAAA-MM-DD`. |
| RN14 | Nome do CSV: `cotacoes_{ORIGEM}-{DESTINO}_{dataInicial}_{dataFinal}.csv`, usando o intervalo dos registros filtrados. Ex.: `cotacoes_EUR-BRL_2026-01-01_2026-03-31.csv`. |
| RN15 | Com zero registros, o botão de exportar fica desabilitado e indica o motivo. |

## 8. Critérios de aceite

### Conversor

- **CA01** — Dado EUR → BRL e valor 100, quando a taxa for carregada, então o resultado mostra 100 × taxa com 2 casas e a data efetiva da cotação.
- **CA02** — Dado EUR → BRL, quando clico em inverter, então o par vira BRL → EUR, o valor continua o mesmo e o resultado é recalculado.
- **CA03** — Dado o valor `0`, `-5`, `abc`, `10,999` ou vazio, então aparece mensagem de erro no campo e nenhum resultado é mostrado.
- **CA04** — Dado o valor `10,50` ou `10.50`, então ambos são aceitos como 10,5.
- **CA05** — Dado origem EUR, quando seleciono EUR como destino, então as moedas são trocadas e nunca ficam iguais.

### Histórico e gráfico

- **CA06** — Para cada um dos 8 períodos, o gráfico mostra cotações reais do intervalo calculado pela RN07.
- **CA07** — Quando mudo o par ou o período, o gráfico e a tabela são atualizados com os novos dados.
- **CA08** — Durante a consulta aparece o estado de loading; se a API falhar aparece mensagem de erro com botão "Tentar novamente".

### Tabela e filtros

- **CA09** — A tabela mostra data, origem, destino e cotação, com o mesmo número de registros do gráfico.
- **CA10** — Ao informar data inicial e final, só aparecem registros dentro do intervalo (inclusive).
- **CA11** — Ao informar cotação mínima e/ou máxima, só aparecem registros dentro da faixa (inclusive).
- **CA12** — Filtros de data e cotação aplicados juntos retornam a interseção.
- **CA13** — "Limpar filtros" restaura todos os registros do período.
- **CA14** — Ordenar por data e por cotação, em ambas as direções, reordena a tabela corretamente.
- **CA15** — O contador mostra "N registros encontrados" e atualiza a cada filtro.
- **CA16** — Filtros sem resultado mostram estado vazio com opção de limpar filtros.

### CSV

- **CA17** — O CSV baixado tem cabeçalho e exatamente os registros filtrados, na ordem da tabela.
- **CA18** — O nome do arquivo segue a RN14.
- **CA19** — Com zero registros, não é possível exportar.

### Geral

- **CA20** — Em 390 px de largura a tela é usável sem rolagem horizontal; em 1440 px usa o layout desktop.
- **CA21** — Um clone novo do repositório roda seguindo apenas o README.

## 9. Rastreabilidade (requisito → cartão do board)

| Requisitos | Cartão |
|---|---|
| RF01–RF08, RN01–RN05 | 3, 5, 6, 8, 9, 10 |
| RF09–RF12, RN06–RN08 | 9, 10, 11, 12 |
| RF13–RF21, RN09–RN12 | 13 |
| RF22–RF26, RN13–RN15 | 14 |
| RF27–RF29 | 10, 15 |
| RNF01–RNF12 | 3 a 16 |
