import styles from './PeriodSelector.module.css'

function PeriodSelector() {
  return (
    <div role="group" aria-label="Período" className={styles.group}>
      <button type="button" className={styles.option} aria-pressed="false">7D</button>
      <button type="button" className={styles.option} aria-pressed="false">15D</button>
      <button type="button" className={styles.option} aria-pressed="true">30D</button>
      <button type="button" className={styles.option} aria-pressed="false">3M</button>
      <button type="button" className={styles.option} aria-pressed="false">6M</button>
      <button type="button" className={styles.option} aria-pressed="false">1A</button>
      <button type="button" className={styles.option} aria-pressed="false">5A</button>
      <button type="button" className={styles.option} aria-pressed="false">10A</button>
    </div>
  )
}

export default PeriodSelector
