import { Info } from 'lucide-react'
import styles from './RateInfo.module.css'

const RATE_FORMAT = { minimumFractionDigits: 4, maximumFractionDigits: 4 }

function RateInfo({ base, quote, rate, date }) {
  const rateDate = new Date(`${date}T00:00:00`)
  const weekday = rateDate.toLocaleDateString('pt-BR', { weekday: 'short' })
  const formattedDate = rateDate.toLocaleDateString('pt-BR')

  const direct = rate.toLocaleString('pt-BR', RATE_FORMAT)
  const inverse = (1 / rate).toLocaleString('pt-BR', RATE_FORMAT)

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
