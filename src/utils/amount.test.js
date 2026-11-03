import { test } from 'node:test'
import assert from 'node:assert/strict'
import { AMOUNT_ERRORS, parseAmount, parseDecimal } from './amount.js'

test('parseAmount aceita vírgula ou ponto como decimal', () => {
  assert.deepEqual(parseAmount('10,5'), { value: 10.5, error: null })
  assert.deepEqual(parseAmount('10.50'), { value: 10.5, error: null })
  assert.deepEqual(parseAmount('  1  '), { value: 1, error: null })
})

test('parseAmount lê milhares no formato pt-BR', () => {
  assert.equal(parseAmount('1.000').value, 1000)
  assert.equal(parseAmount('1.000,50').value, 1000.5)
  assert.equal(parseAmount('1.234.567,89').value, 1234567.89)
})

test('parseAmount aceita o limite de 1 bilhão', () => {
  assert.equal(parseAmount('1000000000').value, 1_000_000_000)
  assert.equal(parseAmount('0,01').value, 0.01)
})

test('parseAmount recusa entradas inválidas (RN02)', () => {
  assert.equal(parseAmount('').error, AMOUNT_ERRORS.empty)
  assert.equal(parseAmount('   ').error, AMOUNT_ERRORS.empty)
  assert.equal(parseAmount('-5').error, AMOUNT_ERRORS.notPositive)
  assert.equal(parseAmount('0').error, AMOUNT_ERRORS.notPositive)
  assert.equal(parseAmount('0,00').error, AMOUNT_ERRORS.notPositive)
  assert.equal(parseAmount('abc').error, AMOUNT_ERRORS.notNumber)
  assert.equal(parseAmount('1e5').error, AMOUNT_ERRORS.notNumber)
  assert.equal(parseAmount('10,999').error, AMOUNT_ERRORS.tooManyDecimals)
  assert.equal(parseAmount('1000000001').error, AMOUNT_ERRORS.tooLarge)
  assert.equal(parseAmount('10').value, 10)
})

test('parseAmount devolve value null sempre que há erro', () => {
  for (const text of ['', '-1', 'abc', '10,999', '2000000000']) {
    assert.equal(parseAmount(text).value, null)
  }
})

test('parseDecimal lê números dos filtros', () => {
  assert.equal(parseDecimal('5,4321'), 5.4321)
  assert.equal(parseDecimal('5.4321'), 5.4321)
  assert.equal(parseDecimal('x'), null)
  assert.equal(parseDecimal(''), null)
})
