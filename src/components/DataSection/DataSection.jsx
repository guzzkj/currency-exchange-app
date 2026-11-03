import styles from './DataSection.module.css'
import ExportCsvButton from '../ExportCsvButton/ExportCsvButton'
import TableFilters from '../TableFilters/TableFilters'
import DataTable from '../DataTable/DataTable'

function DataSection() {
  return (
    <section id="dados" aria-labelledby="data-title" className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="data-title" className={styles.title}>Dados do período</h2>
          <ExportCsvButton />
        </div>

        <TableFilters />

        <p className={styles.countRow} aria-live="polite">
          <span className={styles.count}>22 registros no período</span>
        </p>

        <DataTable />
      </div>
    </section>
  )
}

export default DataSection
