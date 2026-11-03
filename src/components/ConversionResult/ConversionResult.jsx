import styles from './ConversionResult.module.css'
import { formatMoney } from '../../utils/format'

function ConversionResult({ value, currency, loading = false }) {
  // Invalid amount → "—" instead of a number.
  const formattedValue = value === null ? '—' : formatMoney(value)

  return (
    <>
      <span className={styles.label}>Resultado</span>
      <div className={styles.box} aria-live="polite">
        {/* While the rate loads, a placeholder keeps the layout from jumping. */}
        {loading ? (
          <span className={styles.skeleton} aria-label="Carregando cotação" />
        ) : (
          <output className={styles.value}>
            {formattedValue} <span className={styles.code}>{currency}</span>
          </output>
        )}
      </div>
    </>
  )
}

export default ConversionResult
