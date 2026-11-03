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

// Latest published date (a Friday, so the weekend rule RN06 shows up).
export const LATEST_DATE = '2026-10-23'

// How much 1 EUR buys on LATEST_DATE. Any pair is derived from it (cross rate).
const EUR_RATES = {
  AUD: 1.642,
  BRL: 5.4321,
  CAD: 1.511,
  CHF: 0.939,
  CNY: 7.745,
  EUR: 1,
  GBP: 0.864,
  JPY: 164.2,
  MXN: 20.15,
  USD: 1.085,
}

const roundRate = (value) => Math.round(value * 10000) / 10000

// GET /v2/rate/{base}/{quote}
export function getMockRate(base, quote) {
  return {
    base,
    quote,
    rate: roundRate(EUR_RATES[quote] / EUR_RATES[base]),
    date: LATEST_DATE,
  }
}

function getStartDate(endDate, period) {
  const start = new Date(endDate)
  if (period.unit === 'day') start.setUTCDate(start.getUTCDate() - period.amount)
  if (period.unit === 'month') start.setUTCMonth(start.getUTCMonth() - period.amount)
  if (period.unit === 'year') start.setUTCFullYear(start.getUTCFullYear() - period.amount)
  return start
}

// GET /v2/rates?from=...&to=...&base=...&quotes=...
// Business days only: weekends have no published rate (RN08).
// The curve is a deterministic mix of waves, so each pair has its own shape
// and the last point always matches getMockRate().
export function getMockHistory(base, quote, period) {
  const endDate = new Date(`${LATEST_DATE}T00:00:00Z`)
  const seed = [...`${base}${quote}`].reduce((sum, char) => sum + char.charCodeAt(0), 0)

  const dates = []
  for (let day = getStartDate(endDate, period); day <= endDate; day.setUTCDate(day.getUTCDate() + 1)) {
    const weekDay = day.getUTCDay()
    if (weekDay !== 0 && weekDay !== 6) dates.push(day.toISOString().slice(0, 10))
  }

  // `offset` counts business days back from the latest date, so the same date
  // gets the same rate in every period.
  const wave = (offset) =>
    1 +
    0.012 * Math.sin((offset + seed) / 4) +
    0.02 * Math.sin((offset + seed) / 15) +
    0.05 * Math.sin((offset + seed) / 110) +
    0.09 * Math.sin((offset + seed) / 520)

  const lastIndex = dates.length - 1
  const { rate } = getMockRate(base, quote)
  const scale = rate / wave(0)

  return dates.map((date, i) => ({
    date,
    base,
    quote,
    rate: roundRate(wave(i - lastIndex) * scale),
  }))
}
