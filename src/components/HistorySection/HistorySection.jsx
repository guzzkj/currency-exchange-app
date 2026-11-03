import styles from './HistorySection.module.css'
import PeriodSelector from '../PeriodSelector/PeriodSelector'
import HistoryChart from '../HistoryChart/HistoryChart'
import { formatChange, formatRate } from '../../utils/format'
import { getRateStats } from '../../utils/records'

function HistorySection({ base, quote, period, periods, records, onPeriodChange }) {
  const pair = `${base}/${quote}`
  const selectedPeriod = periods.find((option) => option.key === period)

  // Period summary, derived from the records (no extra state).
  const stats = getRateStats(records)
  const isUp = stats.change >= 0
  const formattedChange = formatChange(stats.change)
  const min = formatRate(stats.min)
  const max = formatRate(stats.max)

  return (
    <section id="historico" aria-labelledby="history-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="history-title" className={styles.title}>Histórico {pair}</h2>
          <PeriodSelector options={periods} value={period} onChange={onPeriodChange} />
        </div>

        <p className={styles.summary} aria-live="polite">
          {pair} {isUp ? 'subiu' : 'caiu'}{' '}
          <strong className={isUp ? styles.up : styles.down}>{formattedChange}</strong>{' '}
          em {selectedPeriod.longLabel} · mín. {min} · máx. {max}
        </p>

        <HistoryChart records={records} pair={pair} />
      </div>
    </section>
  )
}

export default HistorySection
