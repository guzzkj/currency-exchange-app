import styles from './TableFilters.module.css'

function TableFilters() {
  return (
    <div className={styles.filters}>
      <div className={styles.field}>
        <label htmlFor="filter-from" className={styles.label}>De</label>
        <input id="filter-from" type="date" className={styles.input} min="2026-09-24" max="2026-10-23" />
      </div>
      <div className={styles.field}>
        <label htmlFor="filter-to" className={styles.label}>Até</label>
        <input id="filter-to" type="date" className={styles.input} min="2026-09-24" max="2026-10-23" />
      </div>
      <div className={styles.field}>
        <label htmlFor="filter-min" className={styles.label}>Cotação mín.</label>
        <input id="filter-min" className={styles.input} inputMode="decimal" placeholder="5,3104" />
      </div>
      <div className={styles.field}>
        <label htmlFor="filter-max" className={styles.label}>Cotação máx.</label>
        <input id="filter-max" className={styles.input} inputMode="decimal" placeholder="5,5207" />
      </div>
    </div>
  )
}

export default TableFilters
