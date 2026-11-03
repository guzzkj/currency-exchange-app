// Pure chart math for HistoryChart (design: LastroApp buildChart).
// Recharts draws; these functions decide what to draw, so they can be tested.

// Lowest and highest rate with their positions (first occurrence wins).
export function getExtremes(records) {
  let minIndex = 0
  let maxIndex = 0
  records.forEach((record, index) => {
    if (record.rate < records[minIndex].rate) minIndex = index
    if (record.rate > records[maxIndex].rate) maxIndex = index
  })
  return { minIndex, maxIndex, min: records[minIndex].rate, max: records[maxIndex].rate }
}

// Decimals of the Y axis: the smaller the variation, the more decimals.
export function getAxisDecimals(span) {
  if (span < 0.05) return 4
  if (span < 0.5) return 3
  if (span < 5) return 2
  if (span < 50) return 1
  return 0
}

// Y axis: 20% of air above and below the line, 4 ticks from min to max.
export function getYAxis(records, tickCount = 4) {
  const { min, max } = getExtremes(records)
  const span = max - min || max * 0.01
  const ticks = [...new Set(Array.from({ length: tickCount }, (_, i) => min + ((max - min) * i) / (tickCount - 1)))]
  return {
    domain: [min - span * 0.2, max + span * 0.2],
    ticks,
    decimals: getAxisDecimals(span),
  }
}

// X axis: `count` dates spread evenly, always the first and the last one.
export function getXTicks(records, count) {
  const lastIndex = records.length - 1
  const indexes = Array.from({ length: count }, (_, i) => Math.round((lastIndex * i) / (count - 1)))
  return [...new Set(indexes)].map((index) => records[index].date)
}

// Long periods show month/year, short ones day/month (more than 140 records ≈ 6 months).
export const LONG_RANGE_RECORDS = 140

// Text anchor of a label so it doesn't leave the chart near the edges.
export function getEdgeAnchor(index, total, edge = 0.08) {
  if (total < 2) return 'middle'
  const position = index / (total - 1)
  if (position < edge) return 'start'
  if (position > 1 - edge) return 'end'
  return 'middle'
}
