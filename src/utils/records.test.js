import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_SORT,
  EMPTY_FILTERS,
  filterRecords,
  getRateStats,
  paginate,
  sortRecords,
  validateFilters,
} from './records.js'

const record = (date, rate) => ({ date, base: 'EUR', quote: 'BRL', rate })

// Ascending by date, as the API returns.
const RECORDS = [
  record('2026-10-19', 5.40),
  record('2026-10-20', 5.45),
  record('2026-10-21', 5.38),
  record('2026-10-22', 5.45),
  record('2026-10-23', 5.50),
]

const dates = (records) => records.map((r) => r.date)

test('filterRecords com filtros vazios devolve tudo (RN10)', () => {
  assert.deepEqual(filterRecords(RECORDS, EMPTY_FILTERS), RECORDS)
})

test('filterRecords por data inicial e final (inclusivas)', () => {
  assert.deepEqual(dates(filterRecords(RECORDS, { ...EMPTY_FILTERS, from: '2026-10-21' })), [
    '2026-10-21',
    '2026-10-22',
    '2026-10-23',
  ])
  assert.deepEqual(dates(filterRecords(RECORDS, { ...EMPTY_FILTERS, to: '2026-10-20' })), [
    '2026-10-19',
    '2026-10-20',
  ])
})

test('filterRecords por cotação mínima e máxima, com vírgula', () => {
  assert.deepEqual(dates(filterRecords(RECORDS, { ...EMPTY_FILTERS, min: '5,45' })), [
    '2026-10-20',
    '2026-10-22',
    '2026-10-23',
  ])
  assert.deepEqual(dates(filterRecords(RECORDS, { ...EMPTY_FILTERS, max: '5.40' })), [
    '2026-10-19',
    '2026-10-21',
  ])
})

test('filterRecords com filtros combinados', () => {
  const filters = { from: '2026-10-20', to: '2026-10-22', min: '5,4', max: '5,45' }
  assert.deepEqual(dates(filterRecords(RECORDS, filters)), ['2026-10-20', '2026-10-22'])
})

test('filterRecords sem resultado devolve array vazio', () => {
  assert.deepEqual(filterRecords(RECORDS, { ...EMPTY_FILTERS, min: '9' }), [])
  assert.deepEqual(filterRecords([], EMPTY_FILTERS), [])
})

test('validateFilters aceita filtros vazios ou coerentes', () => {
  assert.deepEqual(validateFilters(EMPTY_FILTERS), {})
  assert.deepEqual(validateFilters({ from: '2026-10-19', to: '2026-10-19', min: '5', max: '5' }), {})
})

test('validateFilters recusa intervalos invertidos e números inválidos (RN10)', () => {
  assert.ok(validateFilters({ ...EMPTY_FILTERS, from: '2026-10-23', to: '2026-10-19' }).to)
  assert.ok(validateFilters({ ...EMPTY_FILTERS, min: '5,5', max: '5,4' }).max)
  assert.ok(validateFilters({ ...EMPTY_FILTERS, min: 'abc' }).min)
})

test('sortRecords padrão: data mais recente primeiro (RN09)', () => {
  assert.deepEqual(DEFAULT_SORT, { key: 'date', direction: 'desc' })
  assert.deepEqual(dates(sortRecords(RECORDS, DEFAULT_SORT)), [
    '2026-10-23',
    '2026-10-22',
    '2026-10-21',
    '2026-10-20',
    '2026-10-19',
  ])
})

test('sortRecords por data crescente', () => {
  assert.deepEqual(dates(sortRecords(RECORDS, { key: 'date', direction: 'asc' })), dates(RECORDS))
})

test('sortRecords por cotação, empate pela data mais recente', () => {
  assert.deepEqual(dates(sortRecords(RECORDS, { key: 'rate', direction: 'asc' })), [
    '2026-10-21',
    '2026-10-19',
    '2026-10-22',
    '2026-10-20',
    '2026-10-23',
  ])
  assert.deepEqual(dates(sortRecords(RECORDS, { key: 'rate', direction: 'desc' })), [
    '2026-10-23',
    '2026-10-22',
    '2026-10-20',
    '2026-10-19',
    '2026-10-21',
  ])
})

test('sortRecords não altera o array original', () => {
  const copy = [...RECORDS]
  sortRecords(RECORDS, DEFAULT_SORT)
  assert.deepEqual(RECORDS, copy)
})

test('paginate divide em páginas e informa o intervalo', () => {
  assert.deepEqual(paginate(RECORDS, 1, 2), {
    items: RECORDS.slice(0, 2),
    page: 1,
    pageCount: 3,
    from: 1,
    to: 2,
  })
  const last = paginate(RECORDS, 3, 2)
  assert.deepEqual(dates(last.items), ['2026-10-23'])
  assert.equal(last.from, 5)
  assert.equal(last.to, 5)
})

test('paginate corrige página fora do limite', () => {
  assert.equal(paginate(RECORDS, 99, 2).page, 3)
  assert.equal(paginate(RECORDS, 0, 2).page, 1)
  assert.deepEqual(paginate([], 1, 10), { items: [], page: 1, pageCount: 1, from: 0, to: 0 })
})

test('getRateStats resume o período', () => {
  const stats = getRateStats(RECORDS)
  assert.equal(stats.first, 5.4)
  assert.equal(stats.last, 5.5)
  assert.equal(stats.min, 5.38)
  assert.equal(stats.max, 5.5)
  assert.equal(stats.startDate, '2026-10-19')
  assert.equal(stats.endDate, '2026-10-23')
  assert.ok(Math.abs(stats.change - 1.8519) < 0.0001)
})

test('getRateStats sem registros devolve null', () => {
  assert.equal(getRateStats([]), null)
})
