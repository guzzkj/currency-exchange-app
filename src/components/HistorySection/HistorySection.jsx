import { lazy, Suspense } from 'react'
import styles from './HistorySection.module.css'
import PeriodSelector from '../PeriodSelector/PeriodSelector'
import StatusMessage from '../StatusMessage/StatusMessage'
import { formatChange, formatRate } from '../../utils/format'
import { getRateStats } from '../../utils/records'

// Recharts is most of the bundle: the chart loads in its own file, on demand,
// while the skeleton holds its place.
const HistoryChart = lazy(() => import('../HistoryChart/HistoryChart'))

// status: 'loading' | 'error' | 'success'. Success with no records = empty period.
function HistorySection({ base, quote, period, periods, records, status, onRetry, onPeriodChange }) {
  const pair = `${base}/${quote}`
  const selectedPeriod = periods.find((option) => option.key === period)
  const hasData = status === 'success' && records.length > 0

  return (
    <section
      id="historico"
      aria-labelledby="history-title"
      aria-busy={status === 'loading'}
      className={styles.section}
    >
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="history-title" className={styles.title}>Histórico {pair}</h2>
          {/* The period stays clickable during loading and errors. */}
          <PeriodSelector options={periods} value={period} onChange={onPeriodChange} />
        </div>

        {status === 'loading' && <ChartSkeleton />}

        {status === 'error' && (
          <StatusMessage
            mascot="error"
            message="Não consegui carregar o histórico agora."
            actionLabel="Tentar de novo"
            onAction={onRetry}
          />
        )}

        {status === 'success' && records.length === 0 && (
          <StatusMessage mascot="empty" message="Não há cotações publicadas neste período." />
        )}

        {hasData && (
          <>
            <PeriodSummary pair={pair} records={records} periodLabel={selectedPeriod.longLabel} />
            <Suspense fallback={<ChartSkeleton />}>
              <HistoryChart records={records} pair={pair} quote={quote} />
            </Suspense>
          </>
        )}
      </div>
    </section>
  )
}

// Placeholder curve while the records (or the chart code) are loading.
function ChartSkeleton() {
  return (
    <div className={styles.skeleton} aria-hidden="true">
      <svg viewBox="0 0 1000 300" preserveAspectRatio="none">
        <path d="M0 220 C120 200 180 240 300 190 S520 120 640 150 S860 80 1000 100 L1000 300 L0 300 Z" />
      </svg>
    </div>
  )
}

// Period summary, derived from the records (no extra state).
function PeriodSummary({ pair, records, periodLabel }) {
  const stats = getRateStats(records)
  const isUp = stats.change >= 0

  return (
    <p className={styles.summary} aria-live="polite">
      {pair} {isUp ? 'subiu' : 'caiu'}{' '}
      <strong className={isUp ? styles.up : styles.down}>{formatChange(stats.change)}</strong>{' '}
      em {periodLabel} · mín. {formatRate(stats.min)} · máx. {formatRate(stats.max)}
    </p>
  )
}

export default HistorySection
