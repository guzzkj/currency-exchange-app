# Uso de IA no projeto

O projeto foi feito com apoio de IA generativa, do planejamento à entrega. Este documento registra **quais ferramentas** foram usadas, **em quê**, **o que ficou comigo** e **como o resultado foi conferido**.

## Ferramentas

| Ferramenta | Para quê |
|---|---|
| **Claude Code** (Anthropic, modelos Claude Opus) | Planejamento, requisitos, código, testes, documentação e verificação no navegador |
| **Claude Design** | Protótipo visual navegável (`Design/LastroApp.dc.html`), a partir do prompt em `design-prompt.md` |
| **Figma MCP** (via Claude Code) + plugins locais | Geração das páginas do Figma a partir dos wireframes e tokens |
| **Postman** (assistente de IA do app) | Só apareceu como sugestão na tela de erro. Nenhuma sugestão foi aplicada |

## Divisão do trabalho

| Etapa | IA | Eu (Gustavo) |
|---|---|---|
| Entender o briefing | Transformou o briefing em `PLANEJAMENTO.md` (fora do repositório): obrigatórios, opcionais, board de 16 cartões, riscos | Defini que o briefing é a fonte de verdade e que extras só entram depois do obrigatório |
| Requisitos (cartão 1) | Escreveu `REQUIREMENTS.md` com RF, RNF, regras RN01–RN15 e critérios de aceite | Revisei e aprovei |
| Marca e protótipo (cartão 2) | Nome, mascote Ouri, paleta, `design-prompt.md`. Gerou o protótipo no Claude Design e as páginas do Figma pelo MCP. Escreveu os plugins para terminar o que o limite do plano Starter não deixou | Escolhi a direção visual, rodei os plugins no Figma |
| Código (cartões 3 a 15) | Escreveu o código de cada cartão, seguindo o briefing, o design e o planejamento | Defini a regra de **um commit por cartão**, revisei cada entrega e fiz todos os commits e pushes |
| API (cartão 7) | Investigou a API, escreveu `API_TESTS.md` e a Collection com os testes, e rodou pelo Newman | Rodei a Collection no Postman e tirei os prints (`docs/postman/img/`) |
| Testes (cartões 8 e 15) | Escreveu os testes de funções e o roteiro `scripts/validate-scenarios.mjs`, e conferiu cada cartão num Chrome real | Conferi os resultados e os prints |
| Documentação | Escreveu e atualizou `COMPONENTS.md`, `FUNCTION_TESTS.md`, `FIGMA.md` e o README | Revisei |

## Como a IA foi orientada

- **Fontes fixas:** o briefing do curso, o protótipo `Design/LastroApp.dc.html` e o `PLANEJAMENTO.md`. Quando o design e o briefing discordavam, valia o briefing. Exemplo: o nome do CSV segue o `cotacoes_…` sugerido no briefing, e não o `lastro_…` do protótipo.
- **Stack do briefing:** React + JSX + Vite + CSS Modules, sem TypeScript, Tailwind ou back-end, mesmo sendo outras as preferências padrão da ferramenta.
- **Conteúdo das aulas, cartão a cartão:** cada cartão aplica o conceito da aula (props, `useState`, `useEffect`, hooks customizados…). Por isso o cartão 9 liga a API com um `useEffect` simples, e só o cartão 10 trata loading e erro.
- **Escopo:** idiomas, tema escuro, onboarding, KPIs, banner offline e toast estão no protótipo, mas ficaram de fora porque o briefing não pede.
- **Registro:** um arquivo de progresso fora do Git anota o que foi feito em cada cartão e as decisões tomadas.

## Como o resultado foi conferido

A IA não deu nada como pronto sem testar:

- **Testes de funções** (`npm test`, 72 testes) para as regras de negócio. Os testes acharam 2 bugs, corrigidos antes do commit ([FUNCTION_TESTS.md](FUNCTION_TESTS.md#bugs-encontrados-pelos-testes)).
- **Lint e build** a cada cartão.
- **Chrome real** em todo cartão com tela: a IA abria o app, clicava, digitava, baixava o CSV, simulava erro e demora da API e conferia o console e os prints. No cartão 15 isso virou um roteiro com os 15 testes mínimos do briefing (96 verificações), e ele achou mais 3 problemas de layout.
- **Postman:** 16 requisições e 38 asserções, rodadas pela IA no Newman e por mim no app.

## Limites e cuidados

- A IA erra. Exemplos deste projeto: um gráfico ficou com linhas de grade a mais, um import faltou num teste e uma resposta de requisição cancelada chegou a ser gravada. Tudo apareceu nas verificações acima e foi corrigido antes do commit.
- Nenhuma chave, senha ou dado pessoal foi passado para a IA. A API Frankfurter é pública e não precisa de chave.
- As decisões de escopo, a revisão e o histórico de commits são meus. O histórico do Git mostra a evolução cartão a cartão.
