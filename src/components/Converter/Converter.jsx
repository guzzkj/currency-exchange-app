import { useState } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'
import styles from './Converter.module.css'
import AmountInput from '../AmountInput/AmountInput'
import CurrencySelect from '../CurrencySelect/CurrencySelect'
import SwapButton from '../SwapButton/SwapButton'
import ConversionResult from '../ConversionResult/ConversionResult'
import RateInfo from '../RateInfo/RateInfo'
import { DEFAULT_AMOUNT } from '../../constants/defaults'
import { parseAmount } from '../../utils/amount'
import { convert } from '../../utils/conversion'

function Converter({
  base,
  quote,
  currencies,
  rate,
  rateDate,
  rateStatus,
  onRetryRate,
  onBaseChange,
  onQuoteChange,
  onSwap,
}) {
  // Only the converter uses the amount, so the state stays here.
  const [amountText, setAmountText] = useState(String(DEFAULT_AMOUNT))

  // RN02 validation and RN01 math live in utils/ (tested in docs/FUNCTION_TESTS.md).
  const { value: amount, error } = parseAmount(amountText)
  const converted = convert(amount, rate)

  return (
    <section id="conversor" aria-labelledby="converter-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.panel}>
          <h2 id="converter-title" className={styles.title}>Conversor</h2>

          <div className={styles.row}>
            <div className={styles.amount}>
              <AmountInput
                value={amountText}
                onChange={setAmountText}
                invalid={error !== null}
                errorId="amount-error"
              />
            </div>
            <div className={styles.currency}>
              <CurrencySelect
                id="from"
                label="De"
                pickerTitle="Moeda de origem"
                value={base}
                options={currencies}
                onChange={onBaseChange}
              />
            </div>
            <SwapButton onClick={onSwap} />
            <div className={styles.currency}>
              <CurrencySelect
                id="to"
                label="Para"
                pickerTitle="Moeda de destino"
                align="end"
                value={quote}
                options={currencies}
                onChange={onQuoteChange}
              />
            </div>
            <div className={styles.result}>
              {/* Skeleton only when there is a valid amount to convert. */}
              <ConversionResult
                value={converted}
                currency={quote}
                loading={rateStatus === 'loading' && error === null}
              />
            </div>
          </div>

          {error && (
            <p id="amount-error" className={styles.error}>
              <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" />
              {error}
            </p>
          )}

          {rateStatus === 'error' && (
            <div role="alert" className={styles.apiError}>
              <span className={styles.apiErrorText}>
                <AlertCircle size={18} strokeWidth={1.75} aria-hidden="true" />
                Não consegui atualizar a cotação.
              </span>
              <button type="button" className={styles.retry} onClick={onRetryRate}>
                <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
                Tentar de novo
              </button>
            </div>
          )}

          <div className={styles.divider} />

          {rateStatus === 'success' && <RateInfo base={base} quote={quote} rate={rate} date={rateDate} />}
        </div>
      </div>
    </section>
  )
}

export default Converter
