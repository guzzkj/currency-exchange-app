import { ArrowLeftRight } from 'lucide-react'
import styles from './SwapButton.module.css'

function SwapButton({ onClick }) {
  return (
    <button type="button" className={styles.button} aria-label="Inverter moedas" onClick={onClick}>
      <ArrowLeftRight size={20} strokeWidth={1.75} />
    </button>
  )
}

export default SwapButton
