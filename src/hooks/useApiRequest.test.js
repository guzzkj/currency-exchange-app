import { test } from 'node:test'
import assert from 'node:assert/strict'
import { getStatus } from './useApiRequest.js'

test('getStatus: sem resultado da requisição atual = loading', () => {
  assert.equal(getStatus({ key: null, data: null, error: null }, 'EUR/BRL#0'), 'loading')
})

test('getStatus: resultado de outra requisição (par antigo) continua loading', () => {
  const result = { key: 'EUR/BRL#0', data: { rate: 6.1 }, error: null }
  assert.equal(getStatus(result, 'BRL/EUR#0'), 'loading')
})

test('getStatus: depois de "Tentar de novo" a key muda e volta para loading', () => {
  const result = { key: 'EUR/BRL#0', data: null, error: new Error('x') }
  assert.equal(getStatus(result, 'EUR/BRL#1'), 'loading')
})

test('getStatus: resultado da requisição atual = success ou error', () => {
  assert.equal(getStatus({ key: 'EUR/BRL#0', data: [], error: null }, 'EUR/BRL#0'), 'success')
  assert.equal(getStatus({ key: 'EUR/BRL#0', data: null, error: new Error('x') }, 'EUR/BRL#0'), 'error')
})
