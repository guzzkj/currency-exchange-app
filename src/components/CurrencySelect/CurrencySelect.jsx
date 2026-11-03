import { ChevronDown } from 'lucide-react'
import styles from './CurrencySelect.module.css'

function CurrencySelect({ id, label, currency }) {
  const labelId = `${id}-label`
  const buttonId = `${id}-button`

  return (
    <>
      <span id={labelId} className={styles.label}>{label}</span>
      <button
        type="button"
        id={buttonId}
        className={styles.button}
        aria-haspopup="listbox"
        aria-labelledby={`${labelId} ${buttonId}`}
      >
        <span className={styles.code}>{currency.code}</span>
        <span className={styles.name}>{currency.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </>
  )
}

export default CurrencySelect
