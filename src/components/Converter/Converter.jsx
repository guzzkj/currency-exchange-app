import { useState } from 'react'
import { AlertCircle } from 'lucide-react'
import styles from './Converter.module.css'
import AmountInput from '../AmountInput/AmountInput'
import CurrencySelect from '../CurrencySelect/CurrencySelect'
import SwapButton from '../SwapButton/SwapButton'
import ConversionResult from '../ConversionResult/ConversionResult'
import RateInfo from '../RateInfo/RateInfo'
import { DEFAULT_AMOUNT } from '../../constants/defaults'

const MAX_AMOUNT = 1_000_000_000

// RN02: accepts comma or dot as decimal separator, > 0, up to 2 decimals, up to 1 billion.
// "1.000" and "1.000,50" are read as thousands (pt-BR). Moves to utils/ in card 8.
function parseAmount(text) {
  const trimmed = text.trim()
  if (trimmed === '') return { value: null, error: 'Digite um valor para converter.' }
  if (trimmed.startsWith('-')) return { value: null, error: 'Digite um valor maior que zero.' }

  let normalized = trimmed
  if (trimmed.includes(',')) normalized = trimmed.replace(/\./g, '').replace(',', '.')
  else if (/^\d{1,3}(\.\d{3})+$/.test(trimmed)) normalized = trimmed.replace(/\./g, '')

  if (!/^\d+(\.\d+)?$/.test(normalized)) {
    return { value: null, error: 'Use apenas números, com vírgula ou ponto nos centavos.' }
  }

  const decimals = normalized.split('.')[1] ?? ''
  if (decimals.length > 2) return { value: null, error: 'Use no máximo 2 casas decimais.' }

  const value = Number(normalized)
  if (value <= 0) return { value: null, error: 'Digite um valor maior que zero.' }
  if (value > MAX_AMOUNT) return { value: null, error: 'O valor máximo é 1.000.000.000.' }

  return { value, error: null }
}

function Converter({ base, quote, currencies, rate, rateDate, onBaseChange, onQuoteChange, onSwap }) {
  // Only the converter uses the amount, so the state stays here.
  const [amountText, setAmountText] = useState(String(DEFAULT_AMOUNT))

  const { value: amount, error } = parseAmount(amountText)
  // RN01: the app does the math, the API only gives the rate.
  const converted = amount === null ? null : amount * rate

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
              <ConversionResult value={converted} currency={quote} />
            </div>
          </div>

          {error && (
            <p id="amount-error" className={styles.error}>
              <AlertCircle size={16} strokeWidth={1.75} aria-hidden="true" />
              {error}
            </p>
          )}

          <div className={styles.divider} />

          <RateInfo base={base} quote={quote} rate={rate} date={rateDate} />
        </div>
      </div>
    </section>
  )
}

export default Converter
