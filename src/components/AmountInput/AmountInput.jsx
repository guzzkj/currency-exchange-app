import styles from './AmountInput.module.css'

function AmountInput() {
  return (
    <>
      <label htmlFor="amount" className={styles.label}>Valor</label>
      <input
        id="amount"
        className={styles.input}
        inputMode="decimal"
        autoComplete="off"
        defaultValue="1.000"
      />
    </>
  )
}

export default AmountInput
