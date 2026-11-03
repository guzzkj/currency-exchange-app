import { test } from 'node:test'
import assert from 'node:assert/strict'
import { convert, invertRate, selectCurrency, swapPair } from './conversion.js'

test('convert multiplica valor pela taxa (RN01)', () => {
  assert.equal(convert(1, 5.4321), 5.4321)
  assert.equal(convert(100, 5.4321), 543.21)
  assert.equal(convert(2.5, 2), 5)
})

test('convert devolve null sem valor ou sem taxa', () => {
  assert.equal(convert(null, 5.4321), null)
  assert.equal(convert(10, undefined), null)
  assert.equal(convert(10, NaN), null)
})

test('invertRate calcula a taxa inversa', () => {
  assert.equal(invertRate(2), 0.5)
  assert.equal(invertRate(4), 0.25)
  assert.equal(invertRate(0), null)
  assert.equal(invertRate(undefined), null)
})

test('selectCurrency troca de moeda sem repetir o par (RN03)', () => {
  const pair = { base: 'EUR', quote: 'BRL' }
  assert.deepEqual(selectCurrency(pair, 'base', 'USD'), { base: 'USD', quote: 'BRL' })
  assert.deepEqual(selectCurrency(pair, 'quote', 'USD'), { base: 'EUR', quote: 'USD' })
  // Escolher a moeda do outro lado inverte o par.
  assert.deepEqual(selectCurrency(pair, 'base', 'BRL'), { base: 'BRL', quote: 'EUR' })
  assert.deepEqual(selectCurrency(pair, 'quote', 'EUR'), { base: 'BRL', quote: 'EUR' })
})

test('selectCurrency não altera o objeto recebido', () => {
  const pair = { base: 'EUR', quote: 'BRL' }
  selectCurrency(pair, 'base', 'BRL')
  assert.deepEqual(pair, { base: 'EUR', quote: 'BRL' })
})

test('swapPair inverte origem e destino (RN04)', () => {
  assert.deepEqual(swapPair({ base: 'EUR', quote: 'BRL' }), { base: 'BRL', quote: 'EUR' })
  // Inverter duas vezes volta ao par original.
  assert.deepEqual(swapPair(swapPair({ base: 'EUR', quote: 'BRL' })), { base: 'EUR', quote: 'BRL' })
})
