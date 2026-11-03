import { useState } from 'react'
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
import { currencies, getMockHistory, getMockRate, LATEST_DATE } from './mocks/mockData'

function App() {
  // Lifting state up: the pair and the period live here because the converter,
  // the history and the table all depend on them.
  const [base, setBase] = useState(DEFAULT_BASE)
  const [quote, setQuote] = useState(DEFAULT_QUOTE)
  const [period, setPeriod] = useState(DEFAULT_PERIOD)

  // Derived during render (no extra state). Replaced by API calls in cards 9–11.
  const latestRate = getMockRate(base, quote)
  const history = getMockHistory(base, quote, period)

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
        <Hero rateDate={LATEST_DATE} />
        <Converter
          base={base}
          quote={quote}
          currencies={currencies}
          rate={latestRate.rate}
          rateDate={latestRate.date}
          onBaseChange={handleBaseChange}
          onQuoteChange={handleQuoteChange}
          onSwap={handleSwap}
        />
        <HistorySection
          base={base}
          quote={quote}
          period={period}
          periods={PERIODS}
          records={history}
          onPeriodChange={setPeriod}
        />
        <DataSection base={base} quote={quote} records={history} />
      </main>
      <Footer />
    </div>
  )
}

export default App
