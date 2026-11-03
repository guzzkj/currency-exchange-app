import { useRef, useState } from 'react'
import { ArrowDownUp, Funnel } from 'lucide-react'
import styles from './DataSection.module.css'
import ExportCsvButton from '../ExportCsvButton/ExportCsvButton'
import TableFilters from '../TableFilters/TableFilters'
import FilterSheet from '../FilterSheet/FilterSheet'
import DataTable from '../DataTable/DataTable'
import DataList from '../DataList/DataList'
import StatusMessage from '../StatusMessage/StatusMessage'
import { TABLE_PAGE_SIZE } from '../../constants/defaults'
import { parseSortValue, SORT_OPTIONS, sortValue } from '../../constants/sort'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import {
  countActiveFilters,
  DEFAULT_SORT,
  EMPTY_FILTERS,
  filterRecords,
  getEffectiveFilters,
  getRateStats,
  sortRecords,
  toggleSort,
  validateFilters,
} from '../../utils/records'

const SKELETON_ROWS = 5

// Same status as the history (both come from the same request).
// Filters, order and page live here: the table, the mobile list, the counter
// (and the CSV in card 14) all use the same filtered list.
function DataSection({ base, quote, records, status }) {
  const isMobile = useMediaQuery('(max-width: 639px)')
  const sheetRef = useRef(null)
  const filterButtonRef = useRef(null)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [sort, setSort] = useState(DEFAULT_SORT)

  // The page goes back to 1 when the records change (new pair or period).
  // Stored with the key of the records it belongs to, like useApiRequest.
  const pair = `${base}/${quote}`
  const stats = status === 'success' ? getRateStats(records) : null
  const recordsKey = stats ? `${pair}/${stats.startDate}/${stats.endDate}` : null
  const [pageState, setPageState] = useState({ key: recordsKey, page: 1 })
  const page = pageState.key === recordsKey ? pageState.page : 1
  const setPage = (next) => setPageState({ key: recordsKey, page: next })

  // Derived on every render (no extra state): errors, filtered and sorted rows.
  const errors = validateFilters(filters)
  const rows = stats ? sortRecords(filterRecords(records, getEffectiveFilters(filters)), sort) : []
  const activeCount = countActiveFilters(filters)

  function handleFilterChange(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function handleClear() {
    setFilters(EMPTY_FILTERS)
    setPage(1)
  }

  function handleSortChange(next) {
    setSort(next)
    setPage(1)
  }

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
            {isMobile ? (
              <div className={styles.toolbar}>
                <button
                  ref={filterButtonRef}
                  type="button"
                  className={styles.toolButton}
                  onClick={() => sheetRef.current.showModal()}
                >
                  <Funnel size={18} strokeWidth={1.75} aria-hidden="true" />
                  {activeCount ? `Filtros (${activeCount})` : 'Filtros'}
                </button>
                <div className={styles.sortSelect}>
                  <ArrowDownUp size={18} strokeWidth={1.75} aria-hidden="true" className={styles.sortIcon} />
                  <select
                    aria-label="Ordenar por"
                    value={sortValue(sort)}
                    onChange={(event) => handleSortChange(parseSortValue(event.target.value))}
                    className={styles.select}
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.label} value={sortValue(option)}>{option.label}</option>
                    ))}
                  </select>
                </div>
                <FilterSheet
                  ref={sheetRef}
                  onClose={() => filterButtonRef.current?.focus()}
                  filters={filters}
                  errors={errors}
                  onFilterChange={handleFilterChange}
                  onClear={handleClear}
                  sort={sort}
                  onSortChange={handleSortChange}
                  dateBounds={{ start: stats.startDate, end: stats.endDate }}
                  rateBounds={{ min: stats.min, max: stats.max }}
                  resultCount={rows.length}
                />
              </div>
            ) : (
              <TableFilters
                filters={filters}
                errors={errors}
                onChange={handleFilterChange}
                onClear={handleClear}
                dateBounds={{ start: stats.startDate, end: stats.endDate }}
                rateBounds={{ min: stats.min, max: stats.max }}
              />
            )}

            <p className={styles.countRow} aria-live="polite">
              <span className={styles.count}>
                {activeCount === 0
                  ? `${records.length} registros no período`
                  : `${activeCount === 1 ? '1 filtro ativo' : `${activeCount} filtros ativos`} · ${rows.length} de ${records.length} registros`}
              </span>
            </p>

            {rows.length === 0 && (
              <StatusMessage
                framed
                mascot="empty"
                message="Nenhum registro com esses filtros. Ajuste o intervalo ou limpe os filtros."
                actionLabel="Limpar filtros"
                actionVariant="secondary"
                onAction={handleClear}
              />
            )}

            {rows.length > 0 && isMobile && (
              <DataList
                records={rows}
                pair={pair}
                visibleCount={page * TABLE_PAGE_SIZE}
                onLoadMore={() => setPage(page + 1)}
              />
            )}

            {rows.length > 0 && !isMobile && (
              <DataTable
                records={rows}
                pair={pair}
                sort={sort}
                onSortChange={(key) => handleSortChange(toggleSort(sort, key))}
                page={page}
                onPageChange={setPage}
                pageSize={TABLE_PAGE_SIZE}
              />
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default DataSection
