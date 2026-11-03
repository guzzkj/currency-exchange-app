import { Info } from 'lucide-react'
import styles from './RateInfo.module.css'

function RateInfo() {
  return (
    <div className={styles.row}>
      <p className={styles.line}>1 EUR = 5,4321 BRL · 1 BRL = 0,1841 EUR</p>
      <div className={styles.dateGroup}>
        <span className={styles.dateBadge}>Cotação de sex., 23/10/2026 (mais recente)</span>
        <button type="button" className={styles.infoButton} aria-label="Sobre a data da cotação">
          <Info size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

export default RateInfo
