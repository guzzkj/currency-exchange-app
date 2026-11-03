import { parseDecimal } from './amount.js'

// Records follow the API: { date: 'AAAA-MM-DD', base, quote, rate }.
// No function here changes the array it receives.

export const EMPTY_FILTERS = { from: '', to: '', min: '', max: '' }

export const DEFAULT_SORT = { key: 'date', direction: 'desc' }

// RN10: start ≤ end, min ≤ max, empty fields don't filter.
// Returns an object with one message per invalid field (empty object = valid).
export function validateFilters(filters) {
  const errors = {}
  const min = filters.min === '' ? null : parseDecimal(filters.min)
  const max = filters.max === '' ? null : parseDecimal(filters.max)

  if (filters.from && filters.to && filters.from > filters.to) {
    errors.to = 'A data final não pode ser anterior à inicial.'
  }
  if (filters.min !== '' && min === null) errors.min = 'Digite um número válido.'
  if (filters.max !== '' && max === null) errors.max = 'Digite um número válido.'
  if (min !== null && max !== null && min > max) {
    errors.max = 'A cotação máxima não pode ser menor que a mínima.'
  }
  return errors
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
