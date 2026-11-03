import styles from './HistorySection.module.css'
import PeriodSelector from '../PeriodSelector/PeriodSelector'
import HistoryChart from '../HistoryChart/HistoryChart'

function HistorySection() {
  return (
    <section id="historico" aria-labelledby="history-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="history-title" className={styles.title}>Histórico EUR/BRL</h2>
          <PeriodSelector />
        </div>

        <p className={styles.summary} aria-live="polite">
          EUR/BRL subiu <strong className={styles.up}>+2,15% ▲</strong> em 30 dias · mín. 5,3104 · máx. 5,5207
        </p>

        <HistoryChart />
      </div>
    </section>
  )
}

export default HistorySection
