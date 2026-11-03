import styles from './ConversionResult.module.css'

function ConversionResult() {
  return (
    <>
      <span className={styles.label}>Resultado</span>
      <div className={styles.box} aria-live="polite">
        <output className={styles.value}>
          5.432,10 <span className={styles.code}>BRL</span>
        </output>
      </div>
    </>
  )
}

export default ConversionResult
