import { afterEach, beforeEach, test } from 'node:test'
import assert from 'node:assert/strict'
import { ApiError, getCurrencies, getHistory, getLatestRate } from './frankfurterApi.js'

// Fake fetch: records the URLs called and answers with the given status/body.
let calls
function mockFetch(status, body) {
  globalThis.fetch = async (url) => {
    calls.push(new URL(url))
    return { ok: status >= 200 && status < 300, status, json: async () => body }
  }
}

const realFetch = globalThis.fetch
beforeEach(() => {
  calls = []
})
afterEach(() => {
  globalThis.fetch = realFetch
})

test('getLatestRate chama /rate/{base}/{quote} com providers=ECB', async () => {
  mockFetch(200, { date: '2026-11-02', base: 'EUR', quote: 'BRL', rate: 6.099 })
  const rate = await getLatestRate('EUR', 'BRL')

  assert.deepEqual(rate, { date: '2026-11-02', base: 'EUR', quote: 'BRL', rate: 6.099 })
  assert.equal(calls[0].pathname, '/v2/rate/EUR/BRL')
  assert.equal(calls[0].searchParams.get('providers'), 'ECB')
})

test('getHistory monta o intervalo do período e remove datas antes do início', async () => {
  mockFetch(200, [
    { date: '2026-10-02', base: 'EUR', quote: 'BRL', rate: 6.2 }, // antes do início (puxada pela API)
    { date: '2026-10-05', base: 'EUR', quote: 'BRL', rate: 6.25 },
    { date: '2026-11-02', base: 'EUR', quote: 'BRL', rate: 6.099 },
  ])
  const records = await getHistory('EUR', 'BRL', '30D', { today: '2026-11-03' })

  const params = calls[0].searchParams
  assert.equal(calls[0].pathname, '/v2/rates')
  assert.equal(params.get('from'), '2026-10-04')
  assert.equal(params.get('to'), '2026-11-03')
  assert.equal(params.get('base'), 'EUR')
  assert.equal(params.get('quotes'), 'BRL')
  assert.equal(params.get('providers'), 'ECB')
  assert.deepEqual(records.map((r) => r.date), ['2026-10-05', '2026-11-02'])
})

test('getHistory devolve [] quando a API não tem dados', async () => {
  mockFetch(200, [])
  assert.deepEqual(await getHistory('EUR', 'BRL', '7D', { today: '2026-11-03' }), [])
})

test('getCurrencies traduz nomes, ordena e remove moedas extintas', async () => {
  mockFetch(200, [
    { iso_code: 'USD', name: 'US Dollar', end_date: '2026-11-02' },
    { iso_code: 'ARS', name: 'Argentine Peso', end_date: '2020-10-30' },
    { iso_code: 'BRL', name: 'Brazilian Real', end_date: '2026-11-02' },
    { iso_code: 'EUR', name: 'Euro', end_date: '2026-10-30' },
  ])
  assert.deepEqual(await getCurrencies(), [
    { code: 'BRL', name: 'Real brasileiro' },
    { code: 'EUR', name: 'Euro' },
    { code: 'USD', name: 'Dólar americano' },
  ])
  assert.equal(calls[0].searchParams.get('providers'), 'ECB')
})

test('erro HTTP vira ApiError com a mensagem e o status da API', async () => {
  mockFetch(422, { status: 422, message: 'invalid currency: XYZ' })
  await assert.rejects(getLatestRate('EUR', 'XYZ'), (error) => {
    assert.ok(error instanceof ApiError)
    assert.equal(error.status, 422)
    assert.equal(error.message, 'invalid currency: XYZ')
    return true
  })
})

test('erro HTTP sem corpo JSON usa mensagem genérica', async () => {
  globalThis.fetch = async () => ({ ok: false, status: 503, json: async () => { throw new SyntaxError('no json') } })
  await assert.rejects(getLatestRate('EUR', 'BRL'), { name: 'ApiError', status: 503, message: 'Erro 503 na API.' })
})

test('falha de rede vira ApiError com status 0', async () => {
  globalThis.fetch = async () => {
    throw new TypeError('Failed to fetch')
  }
  await assert.rejects(getLatestRate('EUR', 'BRL'), { name: 'ApiError', status: 0 })
})

test('cancelamento (AbortError) não vira ApiError', async () => {
  globalThis.fetch = async () => {
    throw new DOMException('aborted', 'AbortError')
  }
  await assert.rejects(getLatestRate('EUR', 'BRL'), { name: 'AbortError' })
})
