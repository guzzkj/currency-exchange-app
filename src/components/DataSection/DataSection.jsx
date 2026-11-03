import styles from './DataSection.module.css'
import ExportCsvButton from '../ExportCsvButton/ExportCsvButton'
import TableFilters from '../TableFilters/TableFilters'
import DataTable from '../DataTable/DataTable'
import { TABLE_PAGE_SIZE } from '../../constants/defaults'
import { getRateStats } from '../../utils/records'

function DataSection({ base, quote, records }) {
  const stats = getRateStats(records)
  const dateBounds = { start: stats.startDate, end: stats.endDate }
  const rateBounds = { min: stats.min, max: stats.max }

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
