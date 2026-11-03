import { useState } from 'react'
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
import { useCurrencies } from './hooks/useCurrencies'
import { useHistory } from './hooks/useHistory'
import { useLatestRate } from './hooks/useLatestRate'

function App() {
  // Lifting state up: the pair and the period live here because the converter,
  // the history and the table all depend on them.
  const [base, setBase] = useState(DEFAULT_BASE)
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)

  // Data from the Frankfurter API, through custom hooks (src/hooks/).
  // Each hook returns { status, data, error, retry }.
  const currencies = useCurrencies()
  const latestRate = useLatestRate(base, quote)
  const history = useHistory(base, quote, period)
  const rate = latestRate.data

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
  if (currencies.status !== 'success') {
    return <Splash status={currencies.status} onRetry={currencies.retry} />
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
          currencies={currencies.data}
          rate={rate?.rate}
          rateDate={rate?.date}
          rateStatus={latestRate.status}
          onRetryRate={latestRate.retry}
          onBaseChange={handleBaseChange}
          onQuoteChange={handleQuoteChange}
          onSwap={handleSwap}
        />
        <HistorySection
          base={base}
          quote={quote}
          period={period}
          periods={PERIODS}
          records={history.data}
          status={history.status}
          onRetry={history.retry}
          onPeriodChange={setPeriod}
        />
        <DataSection base={base} quote={quote} records={history.data} status={history.status} />
      </main>
      <Footer />
    </div>
  )
}

export default App
