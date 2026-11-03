import { addDays, getPeriodRange } from '../utils/dates.js'

// Frankfurter API v2. Investigation and decisions: docs/API_TESTS.md.
export const BASE_URL = 'https://api.frankfurter.dev/v2'

// Only the European Central Bank: business days only (RN08) and one source
// for the converter and the history, so the effective date matches (RN06).
export const PROVIDER = 'ECB'

// A currency is active when it was published in the last few days.
// The list also brings currencies that no longer exist (e.g. ARS until 2020).
const ACTIVE_TOLERANCE_DAYS = 7

const currencyNames = new Intl.DisplayNames(['pt-BR'], { type: 'currency' })

// Error with the HTTP status (0 = no response, e.g. offline).
export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// One place for every request: builds the URL, calls fetch and turns
// HTTP errors into ApiError. fetch only rejects on network failure, so
// `response.ok` has to be checked by hand.
async function request(path, params = {}, { signal } = {}) {
  const url = new URL(BASE_URL + path)
  for (const [key, value] of Object.entries({ ...params, providers: PROVIDER })) {
    url.searchParams.set(key, value)
  }

  let response
  try {
    response = await fetch(url, { signal })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new ApiError('Não foi possível conectar à API. Verifique sua internet.', 0)
  }

  const body = await response.json().catch(() => null)
  if (!response.ok) {
    throw new ApiError(body?.message ?? `Erro ${response.status} na API.`, response.status)
  }
  return body
}

// GET /currencies → [{ code, name }] in alphabetical order, names in pt-BR.
export async function getCurrencies(options) {
  const list = await request('/currencies', {}, options)
  const lastPublished = list.reduce((max, item) => (item.end_date > max ? item.end_date : max), '')
  const activeSince = addDays(lastPublished, -ACTIVE_TOLERANCE_DAYS)

  return list
    .filter((item) => item.end_date >= activeSince)
    .map((item) => ({ code: item.iso_code, name: currencyNames.of(item.iso_code) ?? item.name }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

// GET /rate/{base}/{quote} → { date, base, quote, rate }.
// `date` is the effective date: on weekends/holidays it is the last business day.
export async function getLatestRate(base, quote, options) {
  return request(`/rate/${base}/${quote}`, {}, options)
}

// GET /rates?from&to&base&quotes → [{ date, base, quote, rate }] in ascending date.
// The API also returns the last rate before `from` when `from` has no rate;
// it is dropped so the table never shows a date outside the period (RN07, RN11).
export async function getHistory(base, quote, periodKey, { today, ...options } = {}) {
  const { start, end } = getPeriodRange(periodKey, today)
  const records = await request('/rates', { from: start, to: end, base, quotes: quote }, options)
  return records.filter((record) => record.date >= start)
}
