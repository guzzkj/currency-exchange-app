import styles from './DataSection.module.css'
import ExportCsvButton from '../ExportCsvButton/ExportCsvButton'
import TableFilters from '../TableFilters/TableFilters'
import DataTable from '../DataTable/DataTable'
import { TABLE_PAGE_SIZE } from '../../constants/defaults'

function DataSection({ base, quote, records }) {
  const rates = records.map((record) => record.rate)
  const dateBounds = { start: records[0].date, end: records[records.length - 1].date }
  const rateBounds = { min: Math.min(...rates), max: Math.max(...rates) }

  return (
    <section id="dados" aria-labelledby="data-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="data-title" className={styles.title}>Dados do período</h2>
          <ExportCsvButton />
        </div>

        <TableFilters dateBounds={dateBounds} rateBounds={rateBounds} />

        <p className={styles.countRow} aria-live="polite">
          <span className={styles.count}>{records.length} registros no período</span>
        </p>

        <DataTable records={records} pair={`${base}/${quote}`} pageSize={TABLE_PAGE_SIZE} />
      </div>
    </section>
  )
}

export default DataSection
