import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getAxisDecimals, getEdgeAnchor, getExtremes, getXTicks, getYAxis } from './chart.js'

const records = [
  { date: '2026-10-26', rate: 6.1 },
  { date: '2026-10-27', rate: 6.0 },
  { date: '2026-10-28', rate: 6.3 },
  { date: '2026-10-29', rate: 6.0 },
  { date: '2026-10-30', rate: 6.2 },
]

test('getExtremes: mínimo e máximo com a posição (primeira ocorrência)', () => {
  assert.deepEqual(getExtremes(records), { minIndex: 1, maxIndex: 2, min: 6.0, max: 6.3 })
})

test('getAxisDecimals: menos variação = mais casas', () => {
  assert.equal(getAxisDecimals(0.01), 4)
  assert.equal(getAxisDecimals(0.3), 3)
  assert.equal(getAxisDecimals(1), 2)
  assert.equal(getAxisDecimals(20), 1)
  assert.equal(getAxisDecimals(500), 0)
})

test('getYAxis: 20% de folga e 4 marcas do mínimo ao máximo', () => {
  const axis = getYAxis(records)
  assert.ok(Math.abs(axis.domain[0] - 5.94) < 1e-9)
  assert.ok(Math.abs(axis.domain[1] - 6.36) < 1e-9)
  assert.equal(axis.ticks.length, 4)
  assert.equal(axis.ticks[0], 6.0)
  assert.equal(axis.ticks[3], 6.3)
  assert.equal(axis.decimals, 3)
})

test('getYAxis: taxa constante não gera domínio vazio nem marcas repetidas', () => {
  const flat = [{ date: '2026-10-26', rate: 5 }, { date: '2026-10-27', rate: 5 }]
  const axis = getYAxis(flat)
  assert.ok(axis.domain[0] < 5 && axis.domain[1] > 5)
  assert.deepEqual(axis.ticks, [5])
})

test('getXTicks: espalha as datas e inclui a primeira e a última', () => {
  assert.deepEqual(getXTicks(records, 3), ['2026-10-26', '2026-10-28', '2026-10-30'])
  assert.deepEqual(getXTicks(records.slice(0, 2), 5), ['2026-10-26', '2026-10-27'])
})

test('getEdgeAnchor: rótulos perto das bordas não saem do gráfico', () => {
  assert.equal(getEdgeAnchor(0, 100), 'start')
  assert.equal(getEdgeAnchor(50, 100), 'middle')
  assert.equal(getEdgeAnchor(99, 100), 'end')
  assert.equal(getEdgeAnchor(0, 1), 'middle')
})
