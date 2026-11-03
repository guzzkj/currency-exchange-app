import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import styles from './HistoryChart.module.css'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { getEdgeAnchor, getExtremes, getXTicks, getYAxis, LONG_RANGE_RECORDS } from '../../utils/chart'
import {
  formatAxisDate,
  formatCompactRate,
  formatDate,
  formatLongDate,
  formatNumber,
  formatRate,
} from '../../utils/format'

// Sizes from the design (desktop / mobile below 640px).
const SIZES = {
  desktop: { height: 320, margin: { top: 28, right: 28, bottom: 0, left: 0 }, yAxisWidth: 56, xTicks: 5 },
  mobile: { height: 240, margin: { top: 28, right: 14, bottom: 0, left: 0 }, yAxisWidth: 44, xTicks: 3 },
}

const AXIS_TICK = { fontSize: 12, fill: 'var(--chart-axis-text)' }

// Line chart of the period (Recharts). Updates when `records` changes,
// that is, when the pair or the period changes (useHistory).
function HistoryChart({ records, pair, quote }) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const size = isMobile ? SIZES.mobile : SIZES.desktop

  const yAxis = getYAxis(records)
  const xTicks = getXTicks(records, size.xTicks)
  const longRange = records.length > LONG_RANGE_RECORDS
  const { minIndex, maxIndex } = getExtremes(records)
  const minRecord = records[minIndex]
  const maxRecord = records[maxIndex]
  const lastRecord = records[records.length - 1]
  const hasRange = minRecord.rate !== maxRecord.rate

  const firstRecord = records[0]
  const description = `Gráfico da cotação ${pair} de ${formatDate(firstRecord.date)} a ${formatDate(lastRecord.date)}: de ${formatRate(firstRecord.rate)} a ${formatRate(lastRecord.rate)}, mínima ${formatRate(minRecord.rate)} e máxima ${formatRate(maxRecord.rate)}. Use as setas do teclado para ver cada dia.`

  return (
    <div className={styles.panel}>
      <figure className={styles.chart} aria-label={description}>
        <ResponsiveContainer width="100%" height={size.height}>
          <AreaChart data={records} margin={size.margin}>
            <CartesianGrid vertical={false} syncWithTicks stroke="var(--color-line)" />
            <YAxis
              dataKey="rate"
              domain={yAxis.domain}
              ticks={yAxis.ticks}
              tickFormatter={(value) => formatNumber(value, yAxis.decimals)}
              width={size.yAxisWidth}
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
            />
            <XAxis
              dataKey="date"
              ticks={xTicks}
              interval={0}
              height={30}
              tick={<AxisDateTick ticks={xTicks} longRange={longRange} />}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              content={<ChartTooltip quote={quote} />}
              cursor={{ stroke: 'var(--chart-axis-text)', strokeWidth: 1, strokeDasharray: '3 3' }}
              isAnimationActive={false}
            />
            <Area
              type="linear"
              dataKey="rate"
              stroke="var(--chart-line)"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              fill="var(--chart-line)"
              fillOpacity={0.08}
              dot={false}
              activeDot={{ r: 5, fill: 'var(--chart-line)', stroke: 'var(--color-surface)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            {hasRange && (
              <ReferenceDot
                x={minRecord.date}
                y={minRecord.rate}
                r={3}
                fill="var(--chart-min)"
                stroke="none"
                label={<ExtremeLabel kind="min" rate={minRecord.rate} anchor={getEdgeAnchor(minIndex, records.length)} />}
              />
            )}
            {hasRange && (
              <ReferenceDot
                x={maxRecord.date}
                y={maxRecord.rate}
                r={3}
                fill="var(--chart-max)"
                stroke="none"
                label={<ExtremeLabel kind="max" rate={maxRecord.rate} anchor={getEdgeAnchor(maxIndex, records.length)} />}
              />
            )}
            {/* "Moedinha": the most recent rate (brand detail, no face). */}
            <ReferenceDot
              x={lastRecord.date}
              y={lastRecord.rate}
              r={4}
              fill="var(--chart-marker-today)"
              stroke="var(--chart-marker-today-stroke)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </figure>
    </div>
  )
}

// X axis label: the first one aligned left, the last one right (inside the chart).
function AxisDateTick({ x, y, payload, ticks, longRange }) {
  const index = ticks.indexOf(payload.value)
  const anchor = index === 0 ? 'start' : index === ticks.length - 1 ? 'end' : 'middle'
  return (
    <text x={x} y={y + 14} textAnchor={anchor} {...AXIS_TICK}>
      {formatAxisDate(payload.value, longRange)}
    </text>
  )
}

// "mín. 6,03" below the lowest point, "máx. 6,12" above the highest one.
function ExtremeLabel({ viewBox, kind, rate, anchor }) {
  const isMin = kind === 'min'
  const x = viewBox.x + viewBox.width / 2
  const y = isMin ? viewBox.y + viewBox.height + 15 : viewBox.y - 7
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={12}
      fontWeight={500}
      fill={isMin ? 'var(--chart-min)' : 'var(--chart-max)'}
    >
      {isMin ? 'mín.' : 'máx.'} {formatCompactRate(rate)}
    </text>
  )
}

// Hover/touch/keyboard card: full date and the rate with 4 decimals (RN12).
function ChartTooltip({ active, payload, quote }) {
  if (!active || !payload?.length) return null
  const record = payload[0].payload
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipDate}>{formatLongDate(record.date)}</div>
      <div className={styles.tooltipRate}>
        {formatRate(record.rate)} <span className={styles.tooltipCode}>{quote}</span>
      </div>
    </div>
  )
}

export default HistoryChart
