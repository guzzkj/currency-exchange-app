import { Info } from 'lucide-react'
import styles from './RateInfo.module.css'
import { invertRate } from '../../utils/conversion'
import { formatDate, formatRate, formatWeekday } from '../../utils/format'

function RateInfo({ base, quote, rate, date }) {
  const weekday = formatWeekday(date)
  const formattedDate = formatDate(date)

  const direct = formatRate(rate)
  const inverse = formatRate(invertRate(rate))

  return (
    <div className={styles.row}>
      <p className={styles.line}>
        1 {base} = {direct} {quote} · 1 {quote} = {inverse} {base}
      </p>
      <div className={styles.dateGroup}>
        <span className={styles.dateBadge}>
          Cotação de {weekday}, {formattedDate} (mais recente)
        </span>
        <button type="button" className={styles.infoButton} aria-label="Sobre a data da cotação">
          <Info size={18} strokeWidth={1.75} />
        </button>
      </div>
    </div>
  )
}

export default RateInfo
