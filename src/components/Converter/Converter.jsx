import styles from './Converter.module.css'
import AmountInput from '../AmountInput/AmountInput'
import CurrencySelect from '../CurrencySelect/CurrencySelect'
import SwapButton from '../SwapButton/SwapButton'
import ConversionResult from '../ConversionResult/ConversionResult'
import RateInfo from '../RateInfo/RateInfo'

function Converter() {
  return (
    <section id="conversor" aria-labelledby="converter-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <h2 id="converter-title" className={styles.title}>Conversor</h2>

          <div className={styles.row}>
            <div className={styles.amount}>
              <AmountInput />
            </div>
            <div className={styles.currency}>
              <CurrencySelect id="from" label="De" code="EUR" name="Euro" />
            </div>
            <SwapButton />
            <div className={styles.currency}>
              <CurrencySelect id="to" label="Para" code="BRL" name="Real brasileiro" />
            </div>
            <div className={styles.result}>
              <ConversionResult />
            </div>
          </div>

          <div className={styles.divider} />

          <RateInfo />
        </div>
      </div>
    </section>
  )
}

export default Converter
