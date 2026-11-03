import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Converter from './components/Converter/Converter'
import HistorySection from './components/HistorySection/HistorySection'
import DataSection from './components/DataSection/DataSection'
import Footer from './components/Footer/Footer'

function App() {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>
      <Header />
      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero />
        <Converter />
        <HistorySection />
        <DataSection />
      </main>
      <Footer />
    </div>
  )
}

export default App
