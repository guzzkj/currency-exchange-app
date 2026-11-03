import { Download } from 'lucide-react'
import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Footer from './components/Footer/Footer'
import Converter from './components/Converter/Converter'
import HistorySection from './components/HistorySection/HistorySection'

function App() {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>

      <Header />

      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero />

        <Converter />

        <HistorySection />

        {/* Dados */}
        <section id="dados" aria-labelledby="data-title" className={styles.dataSection}>
          <div className={styles.container}>
            <div className={styles.dataHeader}>
              <h2 id="data-title" className={styles.sectionTitle}>Dados do período</h2>
              <button type="button" className={styles.primaryButton}>
                <Download size={20} strokeWidth={1.75} aria-hidden="true" />
                Exportar CSV
              </button>
            </div>

            <div className={styles.filters}>
              <div className={styles.filterField}>
                <label htmlFor="filter-from" className={styles.label}>De</label>
                <input id="filter-from" type="date" className={styles.input} min="2026-09-24" max="2026-10-23" />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="filter-to" className={styles.label}>Até</label>
                <input id="filter-to" type="date" className={styles.input} min="2026-09-24" max="2026-10-23" />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="filter-min" className={styles.label}>Cotação mín.</label>
                <input id="filter-min" className={styles.input} inputMode="decimal" placeholder="5,3104" />
              </div>
              <div className={styles.filterField}>
                <label htmlFor="filter-max" className={styles.label}>Cotação máx.</label>
                <input id="filter-max" className={styles.input} inputMode="decimal" placeholder="5,5207" />
              </div>
            </div>

            <p className={styles.chipRow} aria-live="polite">
              <span className={styles.chip}>22 registros no período</span>
            </p>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className="visually-hidden">Histórico EUR/BRL</caption>
                <thead>
                  <tr>
                    <th scope="col" aria-sort="descending" className={styles.colDate}>
                      <button type="button" className={`${styles.sortButton} ${styles.sortActive}`}>
                        Data <span aria-hidden="true">↓</span>
                      </button>
                    </th>
                    <th scope="col">De</th>
                    <th scope="col">Para</th>
                    <th scope="col" aria-sort="none" className={styles.numeric}>
                      <button type="button" className={styles.sortButton}>
                        Cotação <span aria-hidden="true">↕</span>
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>23/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4321</td>
                  </tr>
                  <tr>
                    <td>22/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4260</td>
                  </tr>
                  <tr>
                    <td>21/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4390</td>
                  </tr>
                  <tr>
                    <td>20/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4515</td>
                  </tr>
                  <tr>
                    <td>19/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4702</td>
                  </tr>
                  <tr>
                    <td>16/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4980</td>
                  </tr>
                  <tr>
                    <td>15/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,5207</td>
                  </tr>
                  <tr>
                    <td>14/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4931</td>
                  </tr>
                  <tr>
                    <td>13/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4500</td>
                  </tr>
                  <tr>
                    <td>12/10/2026</td>
                    <td className={styles.code}>EUR</td>
                    <td className={styles.code}>BRL</td>
                    <td className={styles.numeric}>5,4230</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className={styles.pagination}>
              <span>Mostrando 1–10 de 22</span>
              <div className={styles.pageControls}>
                <button type="button" className={styles.pageButton} aria-disabled="true">‹ Anterior</button>
                <span className={styles.pageLabel}>1/3</span>
                <button type="button" className={styles.pageButton}>Próxima ›</button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App
