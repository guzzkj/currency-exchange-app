import styles from './DataTable.module.css'
import { formatDate, formatRate } from '../../utils/format'
import { DEFAULT_SORT, paginate, sortRecords } from '../../utils/records'

function DataTable({ records, pair, pageSize }) {
  // Default order: most recent first (RN09). Sorting and paging become interactive in card 13.
  const { items: rows, page, pageCount, from, to } = paginate(sortRecords(records, DEFAULT_SORT), 1, pageSize)

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
                <td className={styles.numeric}>{formatRate(record.rate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className={styles.pagination}>
        <span>
          Mostrando {from}–{to} de {records.length}
        </span>
        <div className={styles.pageControls}>
          <button type="button" className={styles.pageButton} aria-disabled={page <= 1}>‹ Anterior</button>
          <span className={styles.pageLabel}>{page}/{pageCount}</span>
          <button type="button" className={styles.pageButton} aria-disabled={page >= pageCount}>Próxima ›</button>
        </div>
      </div>
    </>
  )
}

export default DataTable
