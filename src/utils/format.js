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
