// RN12: rates with 4 decimals, money with 2, pt-BR format.
const LOCALE = 'pt-BR'

export function formatNumber(value, digits) {
  return value.toLocaleString(LOCALE, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export const formatRate = (rate) => formatNumber(rate, 4)

export const formatMoney = (value) => formatNumber(value, 2)

// +1,23% ▲ / −0,45% ▼ (typographic minus, like the design).
export function formatChange(percent) {
  const isUp = percent >= 0
  return `${isUp ? '+' : '−'}${formatNumber(Math.abs(percent), 2)}% ${isUp ? '▲' : '▼'}`
}

// ISO dates are read in UTC so "2026-10-23" is always 23/10, whatever the timezone.
const toDate = (iso) => new Date(`${iso}T00:00:00Z`)

export const formatDate = (iso) => toDate(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC' })

export const formatShortDate = (iso) =>
  toDate(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', day: '2-digit', month: '2-digit' })

export const formatWeekday = (iso) =>
  toDate(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', weekday: 'short' })

// Chart X axis: "23 de out" (short periods) or "out de 25" (long periods).
export function formatAxisDate(iso, longRange) {
  const options = longRange ? { month: 'short', year: '2-digit' } : { day: '2-digit', month: 'short' }
  return toDate(iso).toLocaleDateString(LOCALE, { timeZone: 'UTC', ...options }).replace(/\./g, '')
}

// Chart tooltip: "Sexta-feira, 30 de outubro de 2026".
export function formatLongDate(iso) {
  const text = toDate(iso).toLocaleDateString(LOCALE, {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// Min/max labels on the chart: 4 decimals below 1, otherwise 2 (design fmtS).
export const formatCompactRate = (rate) => formatNumber(rate, rate < 1 ? 4 : 2)
