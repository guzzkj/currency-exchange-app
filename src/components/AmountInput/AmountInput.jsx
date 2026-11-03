import styles from './AmountInput.module.css'

function AmountInput({ value, onChange, invalid, errorId }) {
  return (
    <>
      <label htmlFor="amount" className={styles.label}>Valor</label>
      <input
        id="amount"
        className={styles.input}
        inputMode="decimal"
        autoComplete="off"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={invalid}
        aria-describedby={invalid ? errorId : undefined}
      />
    </>
  )
}

export default AmountInput
