import styles from './DataSection.module.css'
import ExportCsvButton from '../ExportCsvButton/ExportCsvButton'
import TableFilters from '../TableFilters/TableFilters'
import DataTable from '../DataTable/DataTable'
import StatusMessage from '../StatusMessage/StatusMessage'
import { TABLE_PAGE_SIZE } from '../../constants/defaults'
import { getRateStats } from '../../utils/records'

const SKELETON_ROWS = 5

// Same status as the history (both come from the same request).
// The mascot shows up only in the history, so the screen has one Ouri at most.
function DataSection({ base, quote, records, status }) {
  const stats = status === 'success' ? getRateStats(records) : null

  return (
    <section id="dados" aria-labelledby="data-title" aria-busy={status === 'loading'} className={styles.section}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <h2 id="data-title" className={styles.title}>Dados do período</h2>
          <ExportCsvButton />
        </div>

        {status === 'loading' && (
          <div className={styles.skeleton} aria-hidden="true">
            <div className={styles.skeletonHead} />
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <div key={index} className={styles.skeletonRow}>
                <span className={styles.skeletonDate} />
                <span className={styles.skeletonRate} />
              </div>
            ))}
          </div>
        )}

        {status === 'error' && <StatusMessage framed message="Não consegui carregar o histórico agora." />}

        {status === 'success' && !stats && (
          <StatusMessage framed message="Não há cotações publicadas neste período." />
        )}

        {stats && (
          <>
            <TableFilters
              dateBounds={{ start: stats.startDate, end: stats.endDate }}
              rateBounds={{ min: stats.min, max: stats.max }}
            />

            <p className={styles.countRow} aria-live="polite">
              <span className={styles.count}>{records.length} registros no período</span>
            </p>

            <DataTable records={records} pair={`${base}/${quote}`} pageSize={TABLE_PAGE_SIZE} />
          </>
        )}
      </div>
    </section>
  )
}

export default DataSection
