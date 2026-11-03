import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Converter from './components/Converter/Converter'
import HistorySection from './components/HistorySection/HistorySection'
import DataSection from './components/DataSection/DataSection'
import Footer from './components/Footer/Footer'
import { DEFAULT_BASE, DEFAULT_PERIOD, DEFAULT_QUOTE } from './constants/defaults'
import { PERIODS } from './constants/periods'
import { currencies, history, latestRate } from './mocks/mockData'

function App() {
  // Shared by the converter, the history and the table (becomes state in card 6).
  const base = DEFAULT_BASE
  const quote = DEFAULT_QUOTE
  const period = DEFAULT_PERIOD

  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>
      <Header />
      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero rateDate={latestRate.date} />
        <Converter
          base={base}
          quote={quote}
          currencies={currencies}
          rate={latestRate.rate}
          rateDate={latestRate.date}
        />
        <HistorySection
          base={base}
          quote={quote}
          period={period}
          periods={PERIODS}
          records={history}
        />
        <DataSection base={base} quote={quote} records={history} />
      </main>
      <Footer />
    </div>
  )
}

export default App
