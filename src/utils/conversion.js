// RN01: the API only gives the rate; the app does the math.
// Returns null when there is nothing to convert (invalid amount or no rate yet).
export function convert(amount, rate) {
  if (amount === null || amount === undefined || !Number.isFinite(rate)) return null
  return amount * rate
}

// 1 base = rate quote  →  1 quote = 1 / rate base.
export function invertRate(rate) {
  if (!Number.isFinite(rate) || rate === 0) return null
  return 1 / rate
}

// RN03: base and quote can't be equal. Picking the other side's currency
// swaps the pair instead. `side` is 'base' or 'quote'.
export function selectCurrency(pair, side, code) {
  const other = side === 'base' ? 'quote' : 'base'
  if (code === pair[other]) return { [side]: code, [other]: pair[side] }
  return { ...pair, [side]: code }
}

// RN04: swapping only changes the pair; the amount is kept by the caller.
export function swapPair(pair) {
  return { base: pair.quote, quote: pair.base }
}
