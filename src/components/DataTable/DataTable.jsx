import styles from './DataTable.module.css'

function DataTable() {
  return (
    <>
      <div className={styles.wrap}>
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
    </>
  )
}

export default DataTable
