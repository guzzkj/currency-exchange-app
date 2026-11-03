import styles from './ConversionResult.module.css'
import { formatMoney } from '../../utils/format'

function ConversionResult({ value, currency }) {
  // Invalid amount → "—" instead of a number.
  const formattedValue = value === null ? '—' : formatMoney(value)

  return (
    <>
      <span className={styles.label}>Resultado</span>
      <div className={styles.box} aria-live="polite">
        <output className={styles.value}>
          {formattedValue} <span className={styles.code}>{currency}</span>
        </output>
      </div>
    </>
  )
}

export default ConversionResult
