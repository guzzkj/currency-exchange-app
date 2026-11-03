// Fake data used until the Frankfurter API is integrated (card 9).
// Shapes follow the API v2 responses so the swap to real data is direct.

// GET /v2/currencies (subset)
export const currencies = [
  { code: 'AUD', name: 'Dólar australiano' },
  { code: 'BRL', name: 'Real brasileiro' },
  { code: 'CAD', name: 'Dólar canadense' },
  { code: 'CHF', name: 'Franco suíço' },
  { code: 'CNY', name: 'Yuan chinês' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'Libra esterlina' },
  { code: 'JPY', name: 'Iene japonês' },
  { code: 'MXN', name: 'Peso mexicano' },
  { code: 'USD', name: 'Dólar americano' },
]

// GET /v2/rate/EUR/BRL
export const latestRate = {
  base: 'EUR',
  quote: 'BRL',
  rate: 5.4321,
  date: '2026-10-23',
}

// GET /v2/rates?from=2026-09-24&to=2026-10-23&base=EUR&quotes=BRL
// Business days only: weekends have no published rate (RN08).
const historyRates = [
  ['2026-09-24', 5.318],
  ['2026-09-25', 5.324],
  ['2026-09-28', 5.329],
  ['2026-09-29', 5.3104],
  ['2026-09-30', 5.326],
  ['2026-10-01', 5.342],
  ['2026-10-02', 5.356],
  ['2026-10-05', 5.349],
  ['2026-10-06', 5.371],
  ['2026-10-07', 5.389],
  ['2026-10-08', 5.401],
  ['2026-10-09', 5.395],
  ['2026-10-12', 5.423],
  ['2026-10-13', 5.45],
  ['2026-10-14', 5.4931],
  ['2026-10-15', 5.5207],
  ['2026-10-16', 5.498],
  ['2026-10-19', 5.4702],
  ['2026-10-20', 5.4515],
  ['2026-10-21', 5.439],
  ['2026-10-22', 5.426],
  ['2026-10-23', 5.4321],
]

export const history = historyRates.map(([date, rate]) => ({
  date,
  base: 'EUR',
  quote: 'BRL',
  rate,
}))
