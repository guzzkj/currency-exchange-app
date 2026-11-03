import { useRef } from 'react'
import styles from './DataTable.module.css'
import { formatDate, formatRate } from '../../utils/format'
import { paginate } from '../../utils/records'

const ARIA_SORT = { asc: 'ascending', desc: 'descending' }
const SORT_ICON = { asc: '▲', desc: '▼' }

// Desktop table. `records` arrive already filtered and sorted (DataSection).
// Header click sorts by that column (RN09). 50 rows per page.
function DataTable({ records, pair, sort, onSortChange, page, onPageChange, pageSize }) {
  const wrapRef = useRef(null)
  const { items: rows, page: current, pageCount, from, to } = paginate(records, page, pageSize)

  function goToPage(next) {
    if (next < 1 || next > pageCount) return
    onPageChange(next)
    // The table has its own scroll: a new page starts at the top.
    wrapRef.current.scrollTop = 0
  }

  return (
    <>
      <div ref={wrapRef} className={styles.wrap}>
        <table className={styles.table}>
          <caption className="visually-hidden">Histórico {pair}</caption>
          <thead>
            <tr>
              <SortHeader column="date" label="Data" className={styles.colDate} sort={sort} onSortChange={onSortChange} />
              <th scope="col">De</th>
              <th scope="col">Para</th>
              <SortHeader column="rate" label="Cotação" className={styles.numeric} sort={sort} onSortChange={onSortChange} />
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
          <button
            type="button"
            className={styles.pageButton}
            aria-disabled={current <= 1}
            onClick={() => goToPage(current - 1)}
          >
            ‹ Anterior
          </button>
          <span className={styles.pageLabel} aria-label={`Página ${current} de ${pageCount}`}>
            {current}/{pageCount}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            aria-disabled={current >= pageCount}
            onClick={() => goToPage(current + 1)}
          >
            Próxima ›
          </button>
        </div>
      </div>
    </>
  )
}

// Sortable column header. aria-sort tells screen readers the current order.
function SortHeader({ column, label, className, sort, onSortChange }) {
  const isActive = sort.key === column
  return (
    <th scope="col" aria-sort={isActive ? ARIA_SORT[sort.direction] : 'none'} className={className}>
      <button
        type="button"
        className={`${styles.sortButton} ${isActive ? styles.sortActive : ''}`}
        onClick={() => onSortChange(column)}
      >
        {label} <span aria-hidden="true">{isActive ? SORT_ICON[sort.direction] : '⇅'}</span>
      </button>
    </th>
  )
}

export default DataTable
