import styles from './HistorySection.module.css'
import PeriodSelector from '../PeriodSelector/PeriodSelector'
import HistoryChart from '../HistoryChart/HistoryChart'

const RATE_FORMAT = { minimumFractionDigits: 4, maximumFractionDigits: 4 }

function HistorySection({ base, quote, period, periods, records }) {
  const pair = `${base}/${quote}`
  const selectedPeriod = periods.find((option) => option.key === period)

  // Period summary, derived from the records (no extra state).
  const rates = records.map((record) => record.rate)
  const first = rates[0]
  const last = rates[rates.length - 1]
  const change = ((last - first) / first) * 100
  const isUp = change >= 0

  const formattedChange = `${isUp ? '+' : '−'}${Math.abs(change).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}% ${isUp ? '▲' : '▼'}`
  const min = Math.min(...rates).toLocaleString('pt-BR', RATE_FORMAT)
  const max = Math.max(...rates).toLocaleString('pt-BR', RATE_FORMAT)

  return (
    <section id="historico" aria-labelledby="history-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="history-title" className={styles.title}>Histórico {pair}</h2>
          <PeriodSelector options={periods} value={period} />
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
