import styles from './DataTable.module.css'

const RATE_FORMAT = { minimumFractionDigits: 4, maximumFractionDigits: 4 }

const formatDate = (date) => new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR')

function DataTable({ records, pair, pageSize }) {
  // Default order: most recent first (RN09). Sorting and paging become interactive in card 13.
  const rows = [...records].reverse().slice(0, pageSize)
  const pageCount = Math.max(1, Math.ceil(records.length / pageSize))

  return (
    <>
      <div className={styles.wrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">Histórico {pair}</caption>
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
            {rows.map((record) => (
              <tr key={record.date}>
                <td>{formatDate(record.date)}</td>
                <td className={styles.code}>{record.base}</td>
                <td className={styles.code}>{record.quote}</td>
                <td className={styles.numeric}>{record.rate.toLocaleString('pt-BR', RATE_FORMAT)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>
          Mostrando 1–{rows.length} de {records.length}
        </span>
        <div className={styles.pageControls}>
          <button type="button" className={styles.pageButton} aria-disabled="true">‹ Anterior</button>
          <span className={styles.pageLabel}>1/{pageCount}</span>
          <button type="button" className={styles.pageButton} aria-disabled={pageCount <= 1}>Próxima ›</button>
        </div>
      </div>
    </>
  )
}

export default DataTable
