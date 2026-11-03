import styles from './DataList.module.css'
import { formatDate, formatRate } from '../../utils/format'

// Mobile version of the table (below 640px): one card per day.
// Shows `visibleCount` records; "Carregar mais" asks DataSection for more.
function DataList({ records, pair, visibleCount, onLoadMore }) {
  const rows = records.slice(0, visibleCount)

  return (
    <>
      <ul className={styles.list} aria-label={`Histórico ${pair}`}>
        {rows.map((record) => (
          <li key={record.date} className={styles.item}>
            <div className={styles.info}>
              <span className={styles.date}>{formatDate(record.date)}</span>
              <span className={styles.pair}>{record.base} → {record.quote}</span>
            </div>
            <span className={styles.rate}>{formatRate(record.rate)}</span>
          </li>
        ))}
      </ul>

      {records.length > visibleCount && (
        <button type="button" className={styles.more} onClick={onLoadMore}>
          Carregar mais
        </button>
      )}
    </>
  )
}

export default DataList
