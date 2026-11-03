import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  formatAxisDate,
  formatChange,
  formatCompactRate,
  formatDate,
  formatLongDate,
  formatMoney,
  formatNumber,
  formatRate,
  formatShortDate,
  formatWeekday,
} from './format.js'

test('formatRate usa 4 casas no formato pt-BR (RN12)', () => {
  assert.equal(formatRate(5.4321), '5,4321')
  assert.equal(formatRate(1), '1,0000')
  assert.equal(formatRate(0.18409), '0,1841')
  assert.equal(formatRate(164.2), '164,2000')
})

test('formatMoney usa 2 casas e separador de milhar (RN12)', () => {
  assert.equal(formatMoney(5.4321), '5,43')
  assert.equal(formatMoney(1234567.891), '1.234.567,89')
  assert.equal(formatMoney(0.005), '0,01')
})

test('formatNumber aceita qualquer número de casas', () => {
  assert.equal(formatNumber(5.4, 2), '5,40')
  assert.equal(formatNumber(5.4, 0), '5')
})

test('formatChange mostra sinal e seta', () => {
  assert.equal(formatChange(1.234), '+1,23% ▲')
  assert.equal(formatChange(-0.456), '−0,46% ▼')
  assert.equal(formatChange(0), '+0,00% ▲')
})

test('formatDate não muda o dia por causa do fuso', () => {
  assert.equal(formatDate('2026-10-23'), '23/10/2026')
  assert.equal(formatDate('2026-01-01'), '01/01/2026')
  assert.equal(formatShortDate('2026-10-23'), '23/10')
})

test('formatWeekday devolve o dia da semana abreviado', () => {
  assert.equal(formatWeekday('2026-10-23'), 'sex.')
  assert.equal(formatWeekday('2026-10-26'), 'seg.')
})

test('formatAxisDate: dia/mês nos períodos curtos e mês/ano nos longos, sem ponto', () => {
  assert.equal(formatAxisDate('2026-10-23', false), '23 de out')
  assert.equal(formatAxisDate('2026-10-23', true), 'out de 26')
})

test('formatLongDate: data por extenso com inicial maiúscula (tooltip)', () => {
  assert.equal(formatLongDate('2026-10-30'), 'Sexta-feira, 30 de outubro de 2026')
})

test('formatCompactRate: 2 casas, ou 4 abaixo de 1', () => {
  assert.equal(formatCompactRate(6.0993), '6,10')
  assert.equal(formatCompactRate(0.16394), '0,1639')
})
