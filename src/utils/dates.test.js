import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  addDays,
  getBusinessDays,
  getPeriodRange,
  isValidIsoDate,
  isWeekend,
  subtractMonths,
  toIsoDate,
} from './dates.js'

test('toIsoDate usa o calendário local', () => {
  assert.equal(toIsoDate(new Date(2026, 0, 5)), '2026-01-05')
  assert.equal(toIsoDate(new Date(2026, 10, 3, 23, 59)), '2026-11-03')
})

test('isValidIsoDate recusa datas inexistentes ou mal formadas', () => {
  assert.equal(isValidIsoDate('2024-02-29'), true)
  assert.equal(isValidIsoDate('2023-02-29'), false)
  assert.equal(isValidIsoDate('2024-13-01'), false)
  assert.equal(isValidIsoDate('01/05/2024'), false)
  assert.equal(isValidIsoDate(''), false)
})

test('isWeekend identifica sábado e domingo', () => {
  assert.equal(isWeekend('2024-05-04'), true) // sábado
  assert.equal(isWeekend('2024-05-05'), true) // domingo
  assert.equal(isWeekend('2024-05-03'), false) // sexta
  assert.equal(isWeekend('2024-05-06'), false) // segunda
})

test('addDays atravessa mês e ano', () => {
  assert.equal(addDays('2026-10-31', 1), '2026-11-01')
  assert.equal(addDays('2026-01-01', -1), '2025-12-31')
})

test('subtractMonths ajusta o fim do mês', () => {
  assert.equal(subtractMonths('2026-05-31', 3), '2026-02-28')
  assert.equal(subtractMonths('2024-05-31', 3), '2024-02-29')
  assert.equal(subtractMonths('2026-03-15', 6), '2025-09-15')
  assert.equal(subtractMonths('2024-02-29', 12), '2023-02-28')
})

test('getPeriodRange calcula os 8 períodos a partir de hoje (RN07)', () => {
  const today = '2026-11-03'
  const expected = {
    '7D': '2026-10-27',
    '15D': '2026-10-19',
    '30D': '2026-10-04',
    '3M': '2026-08-03',
    '6M': '2026-05-03',
    '1A': '2025-11-03',
    '5A': '2021-11-03',
    '10A': '2016-11-03',
  }
  for (const [key, start] of Object.entries(expected)) {
    assert.deepEqual(getPeriodRange(key, today), { start, end: today }, key)
  }
})

test('getPeriodRange recusa período desconhecido', () => {
  assert.throws(() => getPeriodRange('2S', '2026-11-03'), /Unknown period/)
})

test('getBusinessDays pula fins de semana (RN08)', () => {
  assert.deepEqual(getBusinessDays('2024-05-03', '2024-05-07'), ['2024-05-03', '2024-05-06', '2024-05-07'])
  assert.deepEqual(getBusinessDays('2024-05-04', '2024-05-05'), [])
})
