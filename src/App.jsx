import { Download } from 'lucide-react'
import styles from './App.module.css'
import Header from './components/Header/Header'
import Hero from './components/Hero/Hero'
import Footer from './components/Footer/Footer'
import Converter from './components/Converter/Converter'

function App() {
  return (
    <div className={styles.page}>
      <a href="#main" className={styles.skipLink}>Pular para o conteúdo</a>

      <Header />

      <main id="main" tabIndex="-1" className={styles.main}>
        <Hero />

        <Converter />

        {/* Histórico */}
        <section id="historico" aria-labelledby="history-title" className={styles.section}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <h2 id="history-title" className={styles.sectionTitle}>Histórico EUR/BRL</h2>
              <div role="group" aria-label="Período" className={styles.periods}>
                <button type="button" className={styles.periodButton} aria-pressed="false">7D</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">15D</button>
                <button type="button" className={styles.periodButton} aria-pressed="true">30D</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">3M</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">6M</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">1A</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">5A</button>
                <button type="button" className={styles.periodButton} aria-pressed="false">10A</button>
              </div>
            </div>

            <p className={styles.summary} aria-live="polite">
              EUR/BRL subiu <strong className={styles.up}>+2,15% ▲</strong> em 30 dias · mín. 5,3104 · máx. 5,5207
            </p>

            {/* Gráfico estático com dados fictícios. A biblioteca de gráficos entra no cartão 12. */}
            <div className={styles.chartPanel}>
              <svg
                className={styles.chart}
                viewBox="0 0 900 320"
                role="img"
                aria-label="Cotação EUR/BRL de 24/09/2026 a 23/10/2026, de 5,3180 a 5,4321"
              >
                <g className={styles.chartGrid}>
                  <line x1="56" x2="884" y1="288" y2="288" />
                  <line x1="56" x2="884" y1="197" y2="197" />
                  <line x1="56" x2="884" y1="107" y2="107" />
                  <line x1="56" x2="884" y1="16" y2="16" />
                </g>
                <g className={styles.chartAxis}>
                  <text x="46" y="292" textAnchor="end">5,30</text>
                  <text x="46" y="201" textAnchor="end">5,38</text>
                  <text x="46" y="111" textAnchor="end">5,47</text>
                  <text x="46" y="20" textAnchor="end">5,55</text>
                  <text x="56" y="312" textAnchor="start">24/09</text>
                  <text x="253" y="312" textAnchor="middle">01/10</text>
                  <text x="450" y="312" textAnchor="middle">08/10</text>
                  <text x="647" y="312" textAnchor="middle">15/10</text>
                  <text x="884" y="312" textAnchor="end">23/10</text>
                </g>
                <path
                  className={styles.chartArea}
                  d="M56,288 L56,268 L95,262 L135,256 L174,277 L214,260 L253,242 L293,227 L332,235 L371,211 L411,191 L450,178 L490,185 L529,154 L569,125 L608,78 L647,48 L687,73 L726,103 L766,123 L805,137 L845,151 L884,144 L884,288 Z"
                />
                <polyline
                  className={styles.chartLine}
                  points="56,268 95,262 135,256 174,277 214,260 253,242 293,227 332,235 371,211 411,191 450,178 490,185 529,154 569,125 608,78 647,48 687,73 726,103 766,123 805,137 845,151 884,144"
                />
                <circle className={styles.chartCoin} cx="884" cy="144" r="4" />
              </svg>
            </div>
          </div>
        </section>

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
