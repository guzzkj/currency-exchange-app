import { parseDecimal } from './amount.js'

// Records follow the API: { date: 'AAAA-MM-DD', base, quote, rate }.
// No function here changes the array it receives.

export const EMPTY_FILTERS = { from: '', to: '', min: '', max: '' }

export const DEFAULT_SORT = { key: 'date', direction: 'desc' }

// Empty field = no filter (null). Text that isn't a number = NaN.
function readRate(text) {
  if (text === '') return null
  return parseDecimal(text) ?? Number.NaN
}

// RN10: start ≤ end, min ≤ max, empty fields don't filter.
// Returns an object with one message per invalid field (empty object = valid).
export function validateFilters(filters) {
  const errors = {}
  const min = readRate(filters.min)
  const max = readRate(filters.max)

  if (filters.from && filters.to && filters.from > filters.to) {
    errors.to = 'A data final precisa ser igual ou posterior à inicial.'
  }
  if (Number.isNaN(min)) errors.min = 'Digite um número válido.'
  if (Number.isNaN(max)) errors.max = 'Digite um número válido.'
  const bothNumbers = typeof min === 'number' && typeof max === 'number' && !Number.isNaN(min + max)
  if (bothNumbers && min > max) {
    errors.max = 'A cotação máxima precisa ser igual ou maior que a mínima.'
  }
  return errors
}

// Filters actually applied: an invalid pair is ignored (like the design), so
// the table keeps showing data while the message asks for a fix.
export function getEffectiveFilters(filters) {
  const errors = validateFilters(filters)
  const effective = { ...filters }
  if (errors.to) {
    effective.from = ''
    effective.to = ''
  }
  if (errors.min) effective.min = ''
  if (errors.max) {
    effective.max = ''
    // Inverted range (max < min): ignore both ends.
    if (!errors.min && !Number.isNaN(readRate(filters.max))) effective.min = ''
  }
  return effective
}

// How many fields are filled ("2 filtros ativos").
export const countActiveFilters = (filters) => Object.values(filters).filter((value) => value !== '').length

// Column header click: same column flips the direction, a new one starts descending.
export function toggleSort(sort, key) {
  if (sort.key === key) return { key, direction: sort.direction === 'desc' ? 'asc' : 'desc' }
  return { key, direction: 'desc' }
}

// Keeps the records inside every filled filter. ISO dates compare as text.
export function filterRecords(records, filters) {
  const min = filters.min === '' ? null : parseDecimal(filters.min)
  const max = filters.max === '' ? null : parseDecimal(filters.max)

  return records.filter((record) => {
    if (filters.from && record.date < filters.from) return false
    if (filters.to && record.date > filters.to) return false
    if (min !== null && record.rate < min) return false
    if (max !== null && record.rate > max) return false
    return true
  })
}

// key: 'date' | 'rate', direction: 'asc' | 'desc'.
// Equal rates fall back to the most recent date first.
export function sortRecords(records, { key, direction }) {
  const factor = direction === 'asc' ? 1 : -1
  return [...records].sort((a, b) => {
    if (key === 'rate' && a.rate !== b.rate) return (a.rate - b.rate) * factor
    if (key === 'rate') return b.date.localeCompare(a.date)
    return a.date.localeCompare(b.date) * factor
  })
}

// Pages start at 1. A page past the end shows the last page.
export function paginate(records, page, pageSize) {
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize))
  const current = Math.min(Math.max(1, page), pageCount)
  const startIndex = (current - 1) * pageSize
  const items = records.slice(startIndex, startIndex + pageSize)
  return {
    items,
    page: current,
    pageCount,
    from: items.length ? startIndex + 1 : 0,
    to: startIndex + items.length,
  }
}

// Summary of a period: first/last/min/max rate and the change in %.
// Expects records in ascending date order (as the API returns). Null when empty.
export function getRateStats(records) {
  if (records.length === 0) return null
  const rates = records.map((record) => record.rate)
  const first = rates[0]
  const last = rates[rates.length - 1]
  return {
    first,
    last,
    min: Math.min(...rates),
    max: Math.max(...rates),
    change: ((last - first) / first) * 100,
    startDate: records[0].date,
    endDate: records[records.length - 1].date,
  }
}
