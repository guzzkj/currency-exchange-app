import { ChevronDown } from 'lucide-react'
import styles from './CurrencySelect.module.css'

function CurrencySelect({ id, label, code, name }) {
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
        <span className={styles.code}>{code}</span>
        <span className={styles.name}>{name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>
    </>
  )
}

export default CurrencySelect
