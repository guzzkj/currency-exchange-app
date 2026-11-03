import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CSV_BOM, getCsvFileName, toCsv } from './csv.js'

const RECORDS = [
  { date: '2026-10-22', base: 'EUR', quote: 'BRL', rate: 5.4321 },
  { date: '2026-10-23', base: 'EUR', quote: 'BRL', rate: 5.5 },
]

test('toCsv começa com BOM UTF-8 (RN13)', () => {
  assert.equal(toCsv(RECORDS).charCodeAt(0), 0xfeff)
  assert.ok(toCsv(RECORDS).startsWith(CSV_BOM))
})

test('toCsv gera cabeçalho e linhas separados por ";"', () => {
  const lines = toCsv(RECORDS).slice(1).split('\r\n')
  assert.deepEqual(lines, [
    'data;origem;destino;cotacao',
    '2026-10-22;EUR;BRL;5,4321',
    '2026-10-23;EUR;BRL;5,5000',
    '',
  ])
})

test('toCsv mantém a ordem recebida', () => {
  const lines = toCsv([...RECORDS].reverse()).slice(1).split('\r\n')
  assert.equal(lines[1], '2026-10-23;EUR;BRL;5,5000')
})

test('toCsv sem registros gera só o cabeçalho', () => {
  assert.equal(toCsv([]), `${CSV_BOM}data;origem;destino;cotacao\r\n`)
})

test('getCsvFileName usa o par e o intervalo dos registros (RN14)', () => {
  assert.equal(getCsvFileName('EUR', 'BRL', RECORDS), 'cotacoes_EUR-BRL_2026-10-22_2026-10-23.csv')
  // A ordem da tabela não muda o nome.
  assert.equal(getCsvFileName('EUR', 'BRL', [...RECORDS].reverse()), 'cotacoes_EUR-BRL_2026-10-22_2026-10-23.csv')
})

test('getCsvFileName sem registros devolve null (RN15)', () => {
  assert.equal(getCsvFileName('EUR', 'BRL', []), null)
})
