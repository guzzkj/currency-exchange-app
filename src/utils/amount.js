export const MAX_AMOUNT = 1_000_000_000

export const AMOUNT_ERRORS = {
  empty: 'Digite um valor para converter.',
  notPositive: 'Digite um valor maior que zero.',
  notNumber: 'Use apenas números, com vírgula ou ponto nos centavos.',
  tooManyDecimals: 'Use no máximo 2 casas decimais.',
  tooLarge: 'O valor máximo é 1.000.000.000.',
}

// Turns "1.234,56", "1234.56" or "1.000" into a JS number string ("1234.56").
// Comma present → dots are thousands, comma is the decimal separator (pt-BR).
// No comma → "1.000" / "1.000.000" are thousands; any other dot is decimal.
export function normalizeDecimal(text) {
  const trimmed = String(text).trim()
  if (trimmed.includes(',')) return trimmed.replace(/\./g, '').replace(',', '.')
  if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) return trimmed.replace(/\./g, '')
  return trimmed
}

// Reads a number typed by the user. Returns null when it isn't a valid number.
export function parseDecimal(text) {
  const normalized = normalizeDecimal(text)
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null
  return Number(normalized)
}

// RN02: numeric, > 0, up to 2 decimals, up to 1 billion.
// Returns { value, error }: value is a number when valid, error a message when not.
export function parseAmount(text) {
  const trimmed = String(text).trim()
  if (trimmed === '') return { value: null, error: AMOUNT_ERRORS.empty }
  if (trimmed.startsWith('-')) return { value: null, error: AMOUNT_ERRORS.notPositive }

  const normalized = normalizeDecimal(trimmed)
  if (!/^\d+(\.\d+)?$/.test(normalized)) return { value: null, error: AMOUNT_ERRORS.notNumber }

  const decimals = normalized.split('.')[1] ?? ''
  if (decimals.length > 2) return { value: null, error: AMOUNT_ERRORS.tooManyDecimals }

  const value = Number(normalized)
  if (value <= 0) return { value: null, error: AMOUNT_ERRORS.notPositive }
  if (value > MAX_AMOUNT) return { value: null, error: AMOUNT_ERRORS.tooLarge }

  return { value, error: null }
}
