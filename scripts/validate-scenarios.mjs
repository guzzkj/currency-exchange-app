// Final scenarios (briefing section 9 / PLANEJAMENTO section 8) run in a real browser.
//
// Drives headless Chrome through the DevTools Protocol (no extra dependency: Node 22
// has fetch and WebSocket). Uses the real Frankfurter API, except where a scenario
// needs a failure, a slow answer or an empty period: those requests are intercepted.
//
// Usage:
//   npm run build && npm run preview -- --port 4173 --strictPort   (other terminal)
//   npm run test:scenarios
// Env: CHROME_PATH (Chrome/Edge binary), APP_URL (default http://localhost:4173/).
// Screenshots (evidence) go to docs/img/tests/. Exit code 1 if any check fails.

import { spawn } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const APP_URL = process.env.APP_URL ?? 'http://localhost:4173/'
const API = 'https://api.frankfurter.dev/v2'
const OUT = fileURLToPath(new URL('../docs/img/tests/', import.meta.url))
const PORT = 9335

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const chromePath = CHROME_CANDIDATES.find((path) => existsSync(path))
if (!chromePath) {
  console.error('Chrome not found. Set CHROME_PATH.')
  process.exit(1)
}

mkdirSync(OUT, { recursive: true })
const downloads = mkdtempSync(join(tmpdir(), 'lastro-dl-'))
const chrome = spawn(chromePath, [
  '--headless=new', `--remote-debugging-port=${PORT}`, '--disable-gpu', '--no-first-run',
  `--user-data-dir=${mkdtempSync(join(tmpdir(), 'lastro-cdp-'))}`, 'about:blank',
])

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// ---------- DevTools Protocol plumbing ----------
let targets
for (let i = 0; i < 40 && !targets; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${PORT}/json`)).json() } catch { await sleep(250) }
}
const ws = new WebSocket(targets.find((target) => target.type === 'page').webSocketDebuggerUrl)
await new Promise((resolve) => ws.addEventListener('open', resolve))

let nextId = 0
const pending = new Map()
const consoleProblems = []
let interceptor = () => 'pass'
const heldRequests = []

ws.addEventListener('message', async (event) => {
  const msg = JSON.parse(event.data)
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); return }
  if (msg.method === 'Runtime.exceptionThrown') consoleProblems.push(msg.params.exceptionDetails.exception?.description)
  if (msg.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(msg.params.type)) {
    consoleProblems.push(msg.params.args.map((arg) => arg.value ?? arg.description).join(' '))
  }
  if (msg.method === 'Fetch.requestPaused') {
    const { requestId, request } = msg.params
    const action = interceptor(request.url)
    if (action === 'pass') send('Fetch.continueRequest', { requestId })
    else if (action === 'hold') heldRequests.push({ requestId, url: request.url })
    else {
      send('Fetch.fulfillRequest', {
        requestId,
        responseCode: action.status,
        responseHeaders: [
          { name: 'Content-Type', value: 'application/json' },
          { name: 'Access-Control-Allow-Origin', value: '*' },
        ],
        body: Buffer.from(JSON.stringify(action.body)).toString('base64'),
      })
    }
  }
})

const send = (method, params = {}) => new Promise((resolve) => {
  const id = ++nextId
  pending.set(id, resolve)
  ws.send(JSON.stringify({ id, method, params }))
})

const ev = async (expression) => {
  const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })
  if (res.result?.exceptionDetails) throw new Error(res.result.exceptionDetails.exception?.description)
  return res.result?.result?.value
}

const waitFor = async (expression, ms = 20000) => {
  for (let t = 0; t < ms; t += 150) {
    if (await ev(expression)) return true
    await sleep(150)
  }
  return false
}

const press = async (key, code, keyCode) => {
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, windowsVirtualKeyCode: keyCode })
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: keyCode })
}

const releaseHeld = async () => {
  interceptor = () => 'pass'
  while (heldRequests.length) await send('Fetch.continueRequest', { requestId: heldRequests.shift().requestId })
}

// Screenshot of the viewport, after scrolling the element to the top.
const shot = async (name, selector) => {
  if (selector) await ev(`document.querySelector('${selector}').scrollIntoView({ block: 'start' })`)
  await sleep(250)
  const res = await send('Page.captureScreenshot', { format: 'png' })
  writeFileSync(join(OUT, name), Buffer.from(res.result.data, 'base64'))
  return `docs/img/tests/${name}`
}

// Helpers injected in the page (React controlled inputs need the native setter + input event).
const HELPERS = `
window.$s = (s) => document.querySelector(s)
window.$$s = (s) => [...document.querySelectorAll(s)]
window.setInput = (el, value) => {
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set.call(el, value)
  el.dispatchEvent(new Event('input', { bubbles: true }))
}
window.setField = (id, value) => setInput(document.getElementById(id), value)
window.byText = (sel, text) => $$s(sel).find((el) => el.textContent.trim().startsWith(text))
window.clickText = (sel, text) => byText(sel, text).click()
window.num = (text) => parseFloat(text.replace(/[^0-9,.-]/g, '').replace(/\\./g, '').replace(',', '.'))
window.chip = () => $s('#dados p[aria-live]')?.textContent
window.result = () => $s('#conversor output')?.textContent.trim()
window.pickers = () => $$s('#conversor button[aria-haspopup=listbox]')
window.pair = () => pickers().map((b) => b.querySelector('span').textContent).join('/')
window.rows = () => $$s('#dados tbody tr').map((tr) => [...tr.cells].map((c) => c.textContent))
window.ready = () => !!chip() && $s('#historico').getAttribute('aria-busy') === 'false'
`

const load = async (width, { height = 900, waitReady = true } = {}) => {
  await send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 640 })
  await send('Page.navigate', { url: APP_URL })
  await sleep(300)
  await ev(HELPERS).catch(() => {})
  if (waitReady) {
    await waitFor(`!!document.querySelector('#dados')`)
    await ev(HELPERS)
    await waitFor('ready()')
  }
}

const reinject = () => ev(HELPERS)

// ---------- Report ----------
const results = []
let current

function scenario(id, title) {
  current = { id, title, checks: [], evidence: [] }
  results.push(current)
  console.log(`\n${id}. ${title}`)
}

function check(label, ok, detail = '') {
  current.checks.push({ label, ok, detail })
  console.log(`  ${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`)
}

const evidence = (path) => current.evidence.push(path)

const apiRate = async (base, quote) => (await (await fetch(`${API}/rate/${base}/${quote}?providers=ECB`)).json()).rate
const round2 = (value) => Math.round(value * 100) / 100

await send('Page.enable')
await send('Runtime.enable')
await send('Emulation.setFocusEmulationEnabled', { enabled: true })
// Answers from the HTTP cache skip the interception, so the cache is off.
await send('Network.enable')
await send('Network.setCacheDisabled', { cacheDisabled: true })
await send('Fetch.enable', { patterns: [{ urlPattern: `${API}/*` }] })
await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: downloads })

// =====================================================================
scenario(1, 'Conversão entre duas moedas')
await load(1280)
await ev(`setField('amount', '100')`)
await sleep(150)
const eurBrl = await apiRate('EUR', 'BRL')
let shown = await ev('num(result())')
check('100 EUR em BRL = 100 × cotação da API', shown === round2(100 * eurBrl), `${await ev('result()')} (API: ${eurBrl})`)
check('Linha da cotação com direta e inversa', await ev(`/1 EUR = .* BRL · 1 BRL = .* EUR/.test($s('#conversor').textContent)`))
await ev(`setField('amount', '1.234,56')`)
await sleep(150)
shown = await ev('num(result())')
check('Valor com milhar e vírgula (1.234,56)', shown === round2(1234.56 * eurBrl), await ev('result()'))
await ev(`setField('amount', '100')`)
evidence(await shot('01-conversao.png', '#conversor'))

// =====================================================================
scenario(2, 'Inversão das moedas')
await ev(`$s('button[aria-label="Inverter moedas"]').click()`)
await waitFor(`pair() === 'BRL/EUR' && !$s('#conversor [aria-label="Carregando cotação"]')`)
const brlEur = await apiRate('BRL', 'EUR')
check('Par vira BRL → EUR', (await ev('pair()')) === 'BRL/EUR')
check('Valor digitado mantido (RN04)', (await ev(`$s('#amount').value`)) === '100')
shown = await ev('num(result())')
check('Resultado recalculado com a cotação BRL/EUR', shown === round2(100 * brlEur), `${await ev('result()')} (API: ${brlEur})`)
await waitFor('ready()')
check('Histórico acompanha o par', (await ev(`$s('#history-title').textContent`)) === 'Histórico BRL/EUR')
evidence(await shot('02-inversao.png', '#conversor'))

// =====================================================================
scenario(3, 'Atualização dos dados ao alterar o par')
await load(1280)
await ev(`pickers()[1].click()`)
await sleep(150)
await ev(`setInput($s('#conversor [role=combobox]'), 'USD')`)
await sleep(150)
check('Busca filtra a lista', (await ev(`$$s('#conversor [role=option]').map((o) => o.textContent).join()`)).startsWith('USD'))
await ev(`$s('#to-option-USD').click()`)
await waitFor(`pair() === 'EUR/USD' && ready() && rows()[0]?.[2] === 'USD'`)
const eurUsd = await apiRate('EUR', 'USD')
check('Conversor usa EUR/USD', (await ev('num(result())')) === round2(eurUsd), await ev('result()'))
check('Título do histórico', (await ev(`$s('#history-title').textContent`)) === 'Histórico EUR/USD')
check('Tabela com a nova moeda', await ev(`rows().every((r) => r[1] === 'EUR' && r[2] === 'USD')`))
await ev(`pickers()[0].click()`)
await sleep(150)
await ev(`setInput($s('#conversor [role=combobox]'), 'USD')`)
await sleep(150)
await press('Enter', 'Enter', 13)
await waitFor(`pair() === 'USD/EUR' && ready()`)
check('Escolher a moeda do outro lado inverte o par (RN03)', (await ev('pair()')) === 'USD/EUR')
evidence(await shot('03-troca-de-par.png', '#conversor'))

// =====================================================================
scenario(4, 'Todos os períodos históricos (os 8)')
await load(1280)
const periodCounts = {}
for (const period of ['7D', '15D', '30D', '3M', '6M', '1A', '5A', '10A']) {
  const before = await ev('chip()')
  await ev(`clickText('#historico button[aria-pressed]', '${period}')`)
  await waitFor(`ready() && $s('#historico button[aria-pressed=true]').textContent === '${period}' && (chip() !== ${JSON.stringify(before)} || '${period}' === '30D')`)
  const count = await ev(`num(chip())`)
  const dates = await ev(`(() => { const r = rows().map((x) => x[0].split('/').reverse().join('-')); return [r.at(-1), r[0]] })()`)
  periodCounts[period] = count
  check(`${period}`, count > 0, `${count} registros · ${await ev(`$s('#historico p[aria-live]').textContent`)}`)
  if (period === '7D') check('7D sem fim de semana (RN08)', await ev(`rows().every((r) => { const d = new Date(r[0].split('/').reverse().join('-') + 'T12:00'); return d.getDay() % 6 !== 0 })`), dates.join(' → '))
  if (period === '10A') evidence(await shot('04-periodo-10a.png', '#historico'))
}
const counts = Object.values(periodCounts)
check('Quanto maior o período, mais registros', counts.every((count, i) => i === 0 || count > counts[i - 1]), counts.join(' < '))

// =====================================================================
scenario(5, 'Gráfico com dados reais')
await load(1280)
// The chart file is lazy loaded (React.lazy): wait for the SVG.
await waitFor(`!!$s('#historico .recharts-area-curve')`)
const chart = await ev(`(() => {
  const svg = $s('#historico svg.recharts-surface')
  return {
    hasLine: !!svg?.querySelector('.recharts-area-curve')?.getAttribute('d'),
    labels: [...svg.querySelectorAll('text')].map((t) => t.textContent).filter((t) => /mín|máx/.test(t)),
    yTicks: $$s('#historico .recharts-yAxis .recharts-cartesian-axis-tick').length,
    xTicks: $$s('#historico .recharts-xAxis .recharts-cartesian-axis-tick').length,
    label: $s('#historico figure')?.getAttribute('aria-label'),
  }
})()`)
check('Linha desenhada', chart.hasLine)
check('Marcas de mínima e máxima', chart.labels.length === 2, chart.labels.join(' · '))
check('Descrição para leitor de tela', !!chart.label, chart.label)
const minTable = await ev(`Math.min(...rows().map((r) => num(r[3])))`)
check('Mínima do gráfico = menor cotação da tabela', chart.labels.some((label) => label.includes(String(minTable.toFixed(2)).replace('.', ','))), String(minTable))
await ev(`$s('#historico figure').scrollIntoView({ block: 'center' })`)
await sleep(200)
const box = await ev(`(() => { const r = $s('#historico .recharts-surface').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 } })()`)
await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: box.x, y: box.y })
await sleep(300)
check('Tooltip no hover', await ev(`!!$s('#historico .recharts-tooltip-wrapper')?.textContent`), await ev(`$s('#historico .recharts-tooltip-wrapper')?.textContent`))
evidence(await shot('05-grafico.png', '#historico'))

// =====================================================================
scenario(6, 'Tabela com dados reais')
const total = await ev('num(chip())')
check('Linhas = registros do período', (await ev('rows().length')) === total, `${total} linhas`)
check('Colunas Data · De · Para · Cotação', (await ev(`$$s('#dados th').map((th) => th.textContent.replace(/[▼▲⇅]/g, '').trim()).join(' · ')`)) === 'Data · De · Para · Cotação')
check('Cotação com 4 casas', await ev(`rows().every((r) => /^\\d+,\\d{4}$/.test(r[3]))`))
evidence(await shot('06-tabela.png', '#dados'))

// =====================================================================
scenario(7, 'Filtros individuais e combinados')
const rates = await ev('rows().map((r) => num(r[3])).sort((a, b) => a - b)')
const median = rates[Math.floor(rates.length / 2)]
const medianText = median.toFixed(4).replace('.', ',')
await ev(`setField('filter-min', '${medianText}')`)
await sleep(150)
check('Só cotação mín.', await ev(`rows().every((r) => num(r[3]) >= ${median})`), await ev('chip()'))
await ev(`setField('filter-min', ''); setField('filter-max', '${medianText}')`)
await sleep(150)
check('Só cotação máx.', await ev(`rows().every((r) => num(r[3]) <= ${median})`), await ev('chip()'))
await ev(`setField('filter-max', '')`)
const dates = await ev(`rows().map((r) => r[0].split('/').reverse().join('-')).sort()`)
const midDate = dates[Math.floor(dates.length / 2)]
await ev(`setField('filter-from', '${midDate}')`)
await sleep(150)
check('Só data inicial', await ev(`rows().every((r) => r[0].split('/').reverse().join('-') >= '${midDate}')`), await ev('chip()'))
await ev(`setField('filter-from', ''); setField('filter-to', '${midDate}')`)
await sleep(150)
check('Só data final', await ev(`rows().every((r) => r[0].split('/').reverse().join('-') <= '${midDate}')`), await ev('chip()'))
await ev(`setField('filter-to', ''); setField('filter-from', '${midDate}'); setField('filter-min', '${medianText}')`)
await sleep(150)
const expected = dates.filter((date) => date >= midDate).length
check('Data + cotação combinados', await ev(`rows().every((r) => r[0].split('/').reverse().join('-') >= '${midDate}' && num(r[3]) >= ${median})`) && (await ev('rows().length')) <= expected, await ev('chip()'))
evidence(await shot('07-filtros.png', '#dados'))
await ev(`clickText('#dados button', 'Limpar filtros')`)
await sleep(150)
check('Limpar filtros volta ao total', (await ev('rows().length')) === total, await ev('chip()'))

// =====================================================================
scenario(8, 'Ordenação')
const isSorted = (key, dir) => `(() => { const v = rows().map((r) => ${key === 'rate' ? 'num(r[3])' : "r[0].split('/').reverse().join('-')"}); return v.every((x, i) => i === 0 || (${dir === 'asc' ? 'v[i - 1] <= x' : 'v[i - 1] >= x'})) })()`
check('Padrão: data mais recente primeiro (RN09)', await ev(isSorted('date', 'desc')))
await ev(`clickText('#dados th button', 'Cotação')`)
await sleep(100)
check('Cotação maior primeiro', await ev(isSorted('rate', 'desc')), await ev(`$s('#dados th[aria-sort=descending]').textContent`))
await ev(`clickText('#dados th button', 'Cotação')`)
await sleep(100)
check('Cotação menor primeiro', await ev(isSorted('rate', 'asc')), await ev(`$s('#dados th[aria-sort=ascending]').textContent`))
evidence(await shot('08-ordenacao.png', '#dados'))
await ev(`clickText('#dados th button', 'Data')`)
await sleep(100)
await ev(`clickText('#dados th button', 'Data')`)
await sleep(100)
check('Data mais antiga primeiro', await ev(isSorted('date', 'asc')))

// =====================================================================
scenario(9, 'Exportação CSV')
await ev(`setField('filter-min', '${medianText}')`)
await sleep(150)
const tableRows = await ev(`rows().map((r) => r[0].split('/').reverse().join('-') + ';' + r[3])`)
rmSync(downloads, { recursive: true, force: true })
mkdirSync(downloads)
await ev(`clickText('#dados button', 'Exportar CSV')`)
let file
for (let t = 0; t < 8000 && !file; t += 200) {
  await sleep(200)
  file = readdirSync(downloads).find((name) => name.endsWith('.csv'))
}
const csv = file ? readFileSync(join(downloads, file), 'utf8') : ''
const lines = csv.slice(1).split('\r\n').filter(Boolean)
check('Arquivo gerado no navegador', !!file, file)
check('BOM UTF-8 + cabeçalho', csv.charCodeAt(0) === 0xfeff && lines[0] === 'data;origem;destino;cotacao', lines[0])
check('Exatamente os registros filtrados, na ordem da tabela',
  JSON.stringify(lines.slice(1).map((line) => { const [date, , , rate] = line.split(';'); return `${date};${rate}` })) === JSON.stringify(tableRows),
  `${lines.length - 1} linhas · ${await ev('chip()')}`)
check('Nome com par e intervalo (RN14)', /^cotacoes_EUR-BRL_\d{4}-\d{2}-\d{2}_\d{4}-\d{2}-\d{2}\.csv$/.test(file ?? ''))
await ev(`setField('filter-min', '999')`)
await sleep(150)
await ev(`byText('#dados button', 'Exportar CSV').focus()`)
await sleep(150)
check('0 registros: botão desabilitado com motivo (RN15)',
  (await ev(`byText('#dados button', 'Exportar CSV').getAttribute('aria-disabled')`)) === 'true' &&
  (await ev(`getComputedStyle($s('#dados [role=tooltip]')).display`)) !== 'none',
  await ev(`$s('#dados [role=tooltip]').textContent`))
evidence(await shot('09-csv-desabilitado.png', '#dados'))

// =====================================================================
scenario(10, 'Entradas inválidas')
await load(1280)
for (const [text, label] of [['', 'vazio'], ['0', 'zero'], ['-5', 'negativo'], ['abc', 'texto'], ['1,2,3', 'duas vírgulas']]) {
  await ev(`setField('amount', ${JSON.stringify(text)})`)
  await sleep(120)
  const state = await ev(`[$s('#amount').getAttribute('aria-invalid'), $s('#amount-error')?.textContent, result()]`)
  check(`Valor ${label} (${JSON.stringify(text)})`, state[0] === 'true' && !!state[1] && state[2].startsWith('—'), `${state[1]} · resultado ${state[2]}`)
  if (text === '-5') evidence(await shot('10-valor-invalido.png', '#conversor'))
}
await ev(`setField('amount', '100')`)
await ev(`setField('filter-from', '2026-10-20'); setField('filter-to', '2026-10-10')`)
await sleep(150)
check('Data final antes da inicial', (await ev(`$s('#filter-to').getAttribute('aria-invalid')`)) === 'true', await ev(`$s('#filter-to-error').textContent`))
await ev(`setField('filter-from', ''); setField('filter-to', ''); setField('filter-min', '7'); setField('filter-max', '6')`)
await sleep(150)
check('Cotação máx. menor que a mín.', (await ev(`$s('#filter-max').getAttribute('aria-invalid')`)) === 'true', await ev(`$s('#filter-max-error').textContent`))
check('Filtro inválido é ignorado (tabela continua com dados)', (await ev('rows().length')) > 0, await ev('chip()'))
evidence(await shot('10-filtro-invalido.png', '#dados'))

// =====================================================================
scenario(11, 'Ausência de dados')
await ev(`setField('filter-min', '99'); setField('filter-max', '')`)
await sleep(150)
check('Filtros sem resultado: mensagem + Ouri + Limpar', await ev(`$s('#dados [role=status]')?.textContent.includes('Nenhum registro') && $$s('#dados [role=status] img').length === 1`), await ev(`$s('#dados [role=status] p').textContent`))
evidence(await shot('11-sem-resultado-filtro.png', '#dados'))
interceptor = (url) => (url.includes('/rates?') ? { status: 200, body: [] } : 'pass')
await ev(`clickText('#historico button[aria-pressed]', '7D')`)
await waitFor(`$s('#historico').textContent.includes('Não há cotações')`)
check('Período sem cotações (API devolve lista vazia)', await ev(`$s('#historico').textContent.includes('Não há cotações publicadas neste período.') && $s('#dados').textContent.includes('Não há cotações')`))
check('Exportar desabilitado sem dados', (await ev(`byText('#dados button', 'Exportar CSV').getAttribute('aria-disabled')`)) === 'true')
check('Um Ouri por tela', (await ev(`$$s('main img').length`)) <= 1, `${await ev(`$$s('main img').length`)} Ouri`)
evidence(await shot('11-periodo-vazio.png', '#historico'))
interceptor = () => 'pass'

// =====================================================================
scenario(12, 'Falha na API')
interceptor = (url) => (url.includes('/currencies') ? { status: 500, body: { message: 'Internal error' } } : 'pass')
await load(1280, { waitReady: false })
await waitFor(`document.body.textContent.includes('Não consegui buscar as cotações')`)
await reinject()
check('Lista de moedas falha → tela de erro com "Tentar de novo"', await ev(`!!byText('button', 'Tentar de novo')`))
evidence(await shot('12-falha-moedas.png'))
interceptor = () => 'pass'
await ev(`clickText('button', 'Tentar de novo')`)
await waitFor(`!!document.querySelector('#dados')`)
await reinject()
await waitFor('ready()')
check('Tentar de novo recupera o app', await ev('ready()'))

interceptor = (url) => (url.includes('/rate/') ? { status: 500, body: { message: 'Internal error' } } : 'pass')
await ev(`$s('button[aria-label="Inverter moedas"]').click()`)
await waitFor(`!!$s('#conversor [role=alert]')`)
check('Cotação atual falha → alerta no conversor', await ev(`$s('#conversor [role=alert]').textContent.includes('Não consegui atualizar a cotação.')`))
await sleep(1500)
check('Histórico continua funcionando', await ev('ready()'))
evidence(await shot('12-falha-cotacao.png', '#conversor'))
interceptor = () => 'pass'
await ev(`clickText('#conversor button', 'Tentar de novo')`)
await waitFor(`!$s('#conversor [role=alert]') && !!result() && !result().startsWith('—')`)
check('Tentar de novo no conversor', await ev(`!$s('#conversor [role=alert]')`), await ev('result()'))

interceptor = (url) => (url.includes('/rates?') ? { status: 500, body: { message: 'Internal error' } } : 'pass')
await ev(`clickText('#historico button[aria-pressed]', '15D')`)
await waitFor(`$s('#historico').textContent.includes('Não consegui carregar')`)
check('Histórico falha → erro com Ouri + "Tentar de novo"', await ev(`!!byText('#historico button', 'Tentar de novo') && $$s('#historico img').length === 1`))
check('Tabela mostra erro sem segundo Ouri', await ev(`$s('#dados').textContent.includes('Não consegui carregar') && $$s('#dados img').length === 0`))
evidence(await shot('12-falha-historico.png', '#historico'))
interceptor = () => 'pass'
await ev(`clickText('#historico button', 'Tentar de novo')`)
await waitFor('ready()')
check('Tentar de novo no histórico', await ev('ready() && rows().length > 0'), await ev('chip()'))

interceptor = (url) => (url.includes('/rates?') ? { status: 422, body: { message: 'invalid' } } : 'pass')
await ev(`clickText('#historico button[aria-pressed]', '7D')`)
await waitFor(`$s('#historico').textContent.includes('Não consegui carregar')`)
check('Erro 4xx tratado igual', await ev(`$s('#historico').textContent.includes('Não consegui carregar')`))
interceptor = () => 'pass'

// =====================================================================
scenario(13, 'Estados de loading')
interceptor = () => 'hold'
await load(1280, { waitReady: false })
await sleep(600)
await reinject()
check('Splash "Buscando cotações…" enquanto a lista de moedas carrega', await ev(`document.body.textContent.includes('Buscando cotações')`))
evidence(await shot('13-loading-splash.png'))
// The rate and history hooks already asked during the splash: only the currency list goes on
// (every copy of it: in dev mode StrictMode runs the effect twice).
interceptor = (url) => (url.includes('/currencies') ? 'pass' : 'hold')
for (const held of heldRequests.filter((request) => request.url.includes('/currencies'))) {
  heldRequests.splice(heldRequests.indexOf(held), 1)
  await send('Fetch.continueRequest', { requestId: held.requestId })
}
await waitFor(`!!document.querySelector('#dados')`)
await reinject()
await sleep(300)
check('Resultado em skeleton', await ev(`!!$s('#conversor [aria-label="Carregando cotação"]')`))
check('Histórico e tabela com aria-busy + skeleton', await ev(`$s('#historico').getAttribute('aria-busy') === 'true' && $s('#dados').getAttribute('aria-busy') === 'true'`))
check('Exportar desabilitado durante o loading', (await ev(`byText('#dados button', 'Exportar CSV').getAttribute('aria-disabled')`)) === 'true')
evidence(await shot('13-loading-skeletons.png', '#conversor'))
await releaseHeld()
await waitFor('ready()')
check('Dados aparecem quando a API responde', await ev('ready() && rows().length > 0'))

// =====================================================================
scenario(14, 'Responsividade em desktop e celular')
for (const width of [1280, 1024, 768, 390, 320]) {
  await load(width)
  const layout = await ev(`(() => {
    const options = $$s('#historico button[aria-pressed]')
    return {
      overflow: document.documentElement.scrollWidth - innerWidth,
      periodsVisible: options.every((b) => { const r = b.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth }),
      smallestTap: Math.min(...$$s('main button, main input, main select').filter((el) => el.offsetParent).map((el) => el.getBoundingClientRect().height)),
      mobileList: !!$s('#dados ul li'),
      table: !!$s('#dados table'),
    }
  })()`)
  check(`${width}px sem rolagem horizontal`, layout.overflow <= 0, `${layout.overflow}px`)
  check(`${width}px os 8 períodos visíveis`, layout.periodsVisible)
  check(`${width}px alvos de toque ≥ 24px`, layout.smallestTap >= 24, `menor: ${layout.smallestTap}px`)
  check(`${width}px ${width < 640 ? 'lista em cards' : 'tabela'}`, width < 640 ? layout.mobileList && !layout.table : layout.table)
  if (width === 390) {
    evidence(await shot('14-mobile-390-conversor.png', '#conversor'))
    evidence(await shot('14-mobile-390-historico.png', '#historico'))
    evidence(await shot('14-mobile-390-dados.png', '#dados'))
    await ev(`clickText('#dados button', 'Filtros')`)
    await sleep(400)
    check('390px bottom sheet abre com foco no X', await ev(`$s('dialog').open && document.activeElement.getAttribute('aria-label') === 'Fechar'`))
    evidence(await shot('14-mobile-390-filtros.png'))
    await press('Escape', 'Escape', 27)
  }
  if (width === 320) evidence(await shot('14-mobile-320.png', '#historico'))
  if (width === 1280) {
    evidence(await shot('14-desktop-1280.png'))
    for (const [link, id] of [['Conversor', 'conversor'], ['Histórico', 'historico'], ['Dados', 'dados']]) {
      await ev(`clickText('header a', '${link}')`)
      await sleep(900)
      const gap = await ev(`$s('#${id}').getBoundingClientRect().top - $s('header').getBoundingClientRect().bottom`)
      check(`Menu "${link}" não esconde a seção sob o header`, gap >= -1, `${Math.round(gap)}px abaixo do header`)
    }
  }
}

// =====================================================================
scenario(15, 'Console sem erros')
check('Nenhum erro ou aviso no console durante os cenários', consoleProblems.length === 0, consoleProblems.slice(0, 3).join(' | '))

// ---------- Summary ----------
const failed = results.flatMap((s) => s.checks.filter((c) => !c.ok).map((c) => `${s.id}. ${c.label}`))
const totalChecks = results.reduce((sum, s) => sum + s.checks.length, 0)
console.log(`\n${totalChecks - failed.length}/${totalChecks} verificações ok`)
if (failed.length) console.log('Falharam:\n  ' + failed.join('\n  '))
writeFileSync(join(OUT, 'results.json'), JSON.stringify({ date: new Date().toISOString(), results }, null, 2))

ws.close()
chrome.kill()
rmSync(downloads, { recursive: true, force: true })
process.exit(failed.length ? 1 : 0)
