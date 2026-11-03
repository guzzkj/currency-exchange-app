import styles from './AmountInput.module.css'

function AmountInput({ value }) {
  const formattedValue = value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

  return (
    <>
      <label htmlFor="amount" className={styles.label}>Valor</label>
      <input
        id="amount"
        className={styles.input}
        inputMode="decimal"
        autoComplete="off"
        defaultValue={formattedValue}
      />
    </>
  )
}

export default AmountInput
