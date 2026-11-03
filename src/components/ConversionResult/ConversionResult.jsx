import styles from './ConversionResult.module.css'

function ConversionResult({ value, currency }) {
  const formattedValue = value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

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
