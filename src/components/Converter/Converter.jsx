import styles from './Converter.module.css'
import AmountInput from '../AmountInput/AmountInput'
import CurrencySelect from '../CurrencySelect/CurrencySelect'
import SwapButton from '../SwapButton/SwapButton'
import ConversionResult from '../ConversionResult/ConversionResult'
import RateInfo from '../RateInfo/RateInfo'
import { DEFAULT_AMOUNT } from '../../constants/defaults'

function Converter({ base, quote, currencies, rate, rateDate }) {
  const amount = DEFAULT_AMOUNT
  const baseCurrency = currencies.find((currency) => currency.code === base)
  const quoteCurrency = currencies.find((currency) => currency.code === quote)

  // RN01: the app does the math, the API only gives the rate.
  const converted = amount * rate

  return (
    <section id="conversor" aria-labelledby="converter-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <h2 id="converter-title" className={styles.title}>Conversor</h2>

          <div className={styles.row}>
            <div className={styles.amount}>
              <AmountInput value={amount} />
            </div>
            <div className={styles.currency}>
              <CurrencySelect id="from" label="De" currency={baseCurrency} />
            </div>
            <SwapButton />
            <div className={styles.currency}>
              <CurrencySelect id="to" label="Para" currency={quoteCurrency} />
            </div>
            <div className={styles.result}>
              <ConversionResult value={converted} currency={quote} />
            </div>
          </div>

          <div className={styles.divider} />

          <RateInfo base={base} quote={quote} rate={rate} date={rateDate} />
        </div>
      </div>
    </section>
  )
}

export default Converter
