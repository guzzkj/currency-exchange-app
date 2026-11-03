import styles from './HistoryChart.module.css'
import { formatNumber, formatRate, formatShortDate } from '../../utils/format'

// SVG chart drawn from the records. The charting library replaces it in card 12.
const WIDTH = 900
const HEIGHT = 320
const PADDING = { top: 16, right: 16, bottom: 32, left: 56 }
const Y_TICKS = 4
const X_TICKS = 5

function HistoryChart({ records, pair }) {
  const rates = records.map((record) => record.rate)
  const minRate = Math.min(...rates)
  const maxRate = Math.max(...rates)
  const margin = (maxRate - minRate) * 0.05 || 0.01
  const low = minRate - margin
  const high = maxRate + margin

  const plotWidth = WIDTH - PADDING.left - PADDING.right
  const plotHeight = HEIGHT - PADDING.top - PADDING.bottom
  const baseline = PADDING.top + plotHeight
  const lastIndex = records.length - 1

  const x = (index) => PADDING.left + (lastIndex === 0 ? plotWidth / 2 : (plotWidth * index) / lastIndex)
  const y = (rate) => PADDING.top + plotHeight * (1 - (rate - low) / (high - low))

  const points = records.map((record, index) => `${x(index).toFixed(1)},${y(record.rate).toFixed(1)}`)
  const areaPath = `M${x(0)},${baseline} L${points.join(' L')} L${x(lastIndex)},${baseline} Z`

  const yTicks = Array.from({ length: Y_TICKS }, (_, i) => low + ((high - low) * i) / (Y_TICKS - 1))
  const xTickIndexes = [...new Set(Array.from({ length: X_TICKS }, (_, i) => Math.round((lastIndex * i) / (X_TICKS - 1))))]

  const firstRecord = records[0]
  const lastRecord = records[lastIndex]
  const description = `Cotação ${pair} de ${formatShortDate(firstRecord.date)} a ${formatShortDate(lastRecord.date)}, de ${formatRate(firstRecord.rate)} a ${formatRate(lastRecord.rate)}`

  return (
    <div className={styles.panel}>
      <svg className={styles.chart} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={description}>
        <g className={styles.grid}>
          {yTicks.map((tick) => (
            <line key={tick} x1={PADDING.left} x2={WIDTH - PADDING.right} y1={y(tick)} y2={y(tick)} />
          ))}
        </g>
        <g className={styles.axis}>
          {yTicks.map((tick) => (
            <text key={tick} x={PADDING.left - 10} y={y(tick) + 4} textAnchor="end">
              {formatNumber(tick, 2)}
            </text>
          ))}
          {xTickIndexes.map((index, i) => (
            <text
              key={records[index].date}
              x={x(index)}
              y={HEIGHT - 8}
              textAnchor={i === 0 ? 'start' : i === xTickIndexes.length - 1 ? 'end' : 'middle'}
            >
              {formatShortDate(records[index].date)}
            </text>
          ))}
        </g>
        <path className={styles.area} d={areaPath} />
        <polyline className={styles.line} points={points.join(' ')} />
        <circle className={styles.coin} cx={x(lastIndex)} cy={y(lastRecord.rate)} r="4" />
      </svg>
    </div>
  )
}

export default HistoryChart
