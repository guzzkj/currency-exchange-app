import { PERIODS } from '../constants/periods.js'

// All dates travel as ISO strings ("2026-10-23"), same as the API.
// Math is done in UTC so the user's timezone never shifts a day.

const parseIsoDate = (iso) => new Date(`${iso}T00:00:00Z`)
const toIso = (date) => date.toISOString().slice(0, 10)

// Today's date as the user sees it (local calendar), in ISO format.
export function toIsoDate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function isValidIsoDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false
  const date = parseIsoDate(iso)
  // "2024-13-01" is an Invalid Date; "2023-02-29" rolls over to March.
  return !Number.isNaN(date.getTime()) && toIso(date) === iso
}

export function isWeekend(iso) {
  const weekDay = parseIsoDate(iso).getUTCDay()
  return weekDay === 0 || weekDay === 6
}

export function addDays(iso, amount) {
  const date = parseIsoDate(iso)
  date.setUTCDate(date.getUTCDate() + amount)
  return toIso(date)
}

// Going back months: 31/05 minus 3 months is 28/02 (or 29/02), never 03/03.
export function subtractMonths(iso, amount) {
  const date = parseIsoDate(iso)
  const day = date.getUTCDate()
  date.setUTCDate(1)
  date.setUTCMonth(date.getUTCMonth() - amount)
  const lastDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0)).getUTCDate()
  date.setUTCDate(Math.min(day, lastDay))
  return toIso(date)
}

export function findPeriod(key) {
  return PERIODS.find((period) => period.key === key) ?? null
}

// RN07: end = today, start = today minus the period.
export function getPeriodRange(periodKey, today = toIsoDate()) {
  const period = findPeriod(periodKey)
  if (!period) throw new Error(`Unknown period: ${periodKey}`)

  let start
  if (period.unit === 'day') start = addDays(today, -period.amount)
  if (period.unit === 'month') start = subtractMonths(today, period.amount)
  if (period.unit === 'year') start = subtractMonths(today, period.amount * 12)

  return { start, end: today }
}

// Business days between two dates, both included.
export function getBusinessDays(start, end) {
  const days = []
  for (let day = start; day <= end; day = addDays(day, 1)) {
    if (!isWeekend(day)) days.push(day)
  }
  return days
}
