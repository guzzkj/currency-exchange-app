import { useEffect, useState } from 'react'
import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Converter from './components/Converter/Converter'
import HistorySection from './components/HistorySection/HistorySection'
import DataSection from './components/DataSection/DataSection'
import Footer from './components/Footer/Footer'
import Splash from './components/Splash/Splash'
import { DEFAULT_BASE, DEFAULT_PERIOD, DEFAULT_QUOTE } from './constants/defaults'
import { PERIODS } from './constants/periods'
import { selectCurrency, swapPair } from './utils/conversion'
import { getCurrencies, getHistory, getLatestRate } from './services/frankfurterApi'

const EMPTY_RESULT = { key: null, data: null, error: null }

// 'loading' until the stored result belongs to the current request.
function getStatus(result, key) {
  if (result.key !== key) return 'loading'
  return result.error ? 'error' : 'success'
}

// A cancelled request is not an error: a newer one is already on the way.
function handleError(error, key, setResult) {
  if (error.name === 'AbortError') return
  setResult({ key, data: null, error })
}

function App() {
  // Lifting state up: the pair and the period live here because the converter,
  // the history and the table all depend on them.
  const [base, setBase] = useState(DEFAULT_BASE)
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)

  // Data from the Frankfurter API (services/frankfurterApi.js).
  // Each result remembers which request it answers (`key`). While the current
  // key has no result yet, the status is 'loading': derived, not stored.
  const [currenciesResult, setCurrenciesResult] = useState(EMPTY_RESULT)
  const [rateResult, setRateResult] = useState(EMPTY_RESULT)
  const [historyResult, setHistoryResult] = useState(EMPTY_RESULT)

  // "Tentar de novo" changes the attempt, so the key changes and the effect runs again.
  const [attempts, setAttempts] = useState({ currencies: 0, rate: 0, history: 0 })
  const retry = (name) => setAttempts((current) => ({ ...current, [name]: current[name] + 1 }))

  const currenciesKey = `currencies#${attempts.currencies}`
  const rateKey = `${base}/${quote}#${attempts.rate}`
  const historyKey = `${base}/${quote}/${period}#${attempts.history}`

  // Currency list: when the app opens (and on retry).
  useEffect(() => {
    const controller = new AbortController()
    getCurrencies({ signal: controller.signal })
      .then((data) => setCurrenciesResult({ key: currenciesKey, data, error: null }))
      .catch((error) => handleError(error, currenciesKey, setCurrenciesResult))
    return () => controller.abort()
  }, [currenciesKey])

  // Latest rate: only when the pair changes (not the amount or the period).
  useEffect(() => {
    const controller = new AbortController()
    getLatestRate(base, quote, { signal: controller.signal })
      .then((data) => setRateResult({ key: rateKey, data, error: null }))
      .catch((error) => handleError(error, rateKey, setRateResult))
    // Cleanup: a new pair cancels the old request, so a late answer never
    // overwrites the current one.
    return () => controller.abort()
  }, [base, quote, rateKey])

  // History: when the pair or the period changes.
  useEffect(() => {
    const controller = new AbortController()
    getHistory(base, quote, period, { signal: controller.signal })
      .then((data) => setHistoryResult({ key: historyKey, data, error: null }))
      .catch((error) => handleError(error, historyKey, setHistoryResult))
    return () => controller.abort()
  }, [base, quote, period, historyKey])

  const currenciesStatus = getStatus(currenciesResult, currenciesKey)
  const rateStatus = getStatus(rateResult, rateKey)
  const historyStatus = getStatus(historyResult, historyKey)
  const rate = rateStatus === 'success' ? rateResult.data : null

  function applyPair(pair) {
    setBase(pair.base)
    setQuote(pair.quote)
  }

  // RN03: picking the other side's currency swaps the pair (utils/conversion).
  const handleBaseChange = (code) => applyPair(selectCurrency({ base, quote }, 'base', code))
  const handleQuoteChange = (code) => applyPair(selectCurrency({ base, quote }, 'quote', code))

  // RN04: swapping keeps the typed amount (it lives in Converter).
  const handleSwap = () => applyPair(swapPair({ base, quote }))

  // Without the currency list the app can't work: full-screen loading/error.
  if (currenciesStatus !== 'success') {
    return <Splash status={currenciesStatus} onRetry={() => retry('currencies')} />
  }

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>
      <Header />
      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero rateDate={rate?.date} />
        <Converter
          base={base}
          quote={quote}
          currencies={currenciesResult.data}
          rate={rate?.rate}
          rateDate={rate?.date}
          rateStatus={rateStatus}
          onRetryRate={() => retry('rate')}
          onBaseChange={handleBaseChange}
          onQuoteChange={handleQuoteChange}
          onSwap={handleSwap}
        />
        <HistorySection
          base={base}
          quote={quote}
          period={period}
          periods={PERIODS}
          records={historyResult.data}
          status={historyStatus}
          onRetry={() => retry('history')}
          onPeriodChange={setPeriod}
        />
        <DataSection base={base} quote={quote} records={historyResult.data} status={historyStatus} />
      </main>
      <Footer />
    </div>
  )
}

export default App
