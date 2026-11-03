import { ArrowLeftRight } from 'lucide-react'
import styles from './SwapButton.module.css'

function SwapButton() {
  return (
    <button type="button" className={styles.button} aria-label="Inverter moedas">
      <ArrowLeftRight size={20} strokeWidth={1.75} />
    </button>
  )
}

export default SwapButton
