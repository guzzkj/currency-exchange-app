import { useEffect, useState } from 'react'
import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Converter from './components/Converter/Converter'
import HistorySection from './components/HistorySection/HistorySection'
import DataSection from './components/DataSection/DataSection'
import Footer from './components/Footer/Footer'
import { DEFAULT_BASE, DEFAULT_PERIOD, DEFAULT_QUOTE } from './constants/defaults'
import { PERIODS } from './constants/periods'
import { selectCurrency, swapPair } from './utils/conversion'
import { getCurrencies, getHistory, getLatestRate } from './services/frankfurterApi'

function App() {
  // Lifting state up: the pair and the period live here because the converter,
  // the history and the table all depend on them.
  const [base, setBase] = useState(DEFAULT_BASE)
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)

  // Data from the Frankfurter API (services/frankfurterApi.js).
  // null = not loaded yet. Loading and error states come in card 10.
  const [currencies, setCurrencies] = useState([])
  const [latestRate, setLatestRate] = useState(null)
  const [history, setHistory] = useState(null)

  // Currency list: once, when the app opens.
  useEffect(() => {
    getCurrencies().then(setCurrencies)
  }, [])

  // Latest rate: again whenever the pair changes.
  useEffect(() => {
    getLatestRate(base, quote).then(setLatestRate)
  }, [base, quote])

  // History: again whenever the pair or the period changes.
  useEffect(() => {
    getHistory(base, quote, period).then(setHistory)
  }, [base, quote, period])

  // A rate from the previous pair (request still on the way) is never used.
  const rate = latestRate?.base === base && latestRate?.quote === quote ? latestRate : null

  function applyPair(pair) {
    setBase(pair.base)
    setQuote(pair.quote)
  }

  // RN03: picking the other side's currency swaps the pair (utils/conversion).
  const handleBaseChange = (code) => applyPair(selectCurrency({ base, quote }, 'base', code))
  const handleQuoteChange = (code) => applyPair(selectCurrency({ base, quote }, 'quote', code))

  // RN04: swapping keeps the typed amount (it lives in Converter).
  const handleSwap = () => applyPair(swapPair({ base, quote }))

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>
      <Header />
      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero rateDate={rate?.date} />
        <Converter
          base={base}
          quote={quote}
          currencies={currencies}
          rate={rate?.rate}
          rateDate={rate?.date}
          onBaseChange={handleBaseChange}
          onQuoteChange={handleQuoteChange}
          onSwap={handleSwap}
        />
        {history?.length > 0 && (
          <>
            <HistorySection
              base={base}
              quote={quote}
              period={period}
              periods={PERIODS}
              records={history}
              onPeriodChange={setPeriod}
            />
            <DataSection base={base} quote={quote} records={history} />
          </>
        )}
      </main>
      <Footer />
    </div>
  )
}

export default App
