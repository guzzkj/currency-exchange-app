import { X } from 'lucide-react'
import styles from './FilterSheet.module.css'
import TableFilters from '../TableFilters/TableFilters'
import { SORT_OPTIONS } from '../../constants/sort'

// Mobile bottom sheet with the filters and the order.
// Native <dialog> opened with showModal() (DataSection holds the ref):
// the browser traps the focus, closes on Escape and draws the backdrop.
// Filters apply while typing; "Ver N registros" only closes the sheet.
// onClose (button, backdrop or Escape) gives the focus back to the "Filtros" button.
function FilterSheet({ ref, onClose, filters, errors, onFilterChange, onClear, sort, onSortChange, dateBounds, rateBounds, resultCount }) {
  const close = () => ref.current.close()

  // A click on the backdrop reaches the <dialog> itself (the content is inside a child).
  function handleClick(event) {
    if (event.target === event.currentTarget) close()
  }

  return (
    <dialog ref={ref} className={styles.sheet} aria-labelledby="filter-sheet-title" onClick={handleClick} onClose={onClose}>
      <div className={styles.handle} aria-hidden="true" />
      <div className={styles.header}>
        <h2 id="filter-sheet-title" className={styles.title}>Filtros</h2>
        {/* autoFocus: showModal() moves the focus here (like the design). */}
        <button type="button" className={styles.close} aria-label="Fechar" onClick={close} autoFocus>
          <X size={22} strokeWidth={1.75} aria-hidden="true" />
        </button>
      </div>

      <div className={styles.body}>
        <TableFilters
          layout="sheet"
          idPrefix="sheet-filter"
          filters={filters}
          errors={errors}
          onChange={onFilterChange}
          dateBounds={dateBounds}
          rateBounds={rateBounds}
        />

        <p id="sheet-sort-label" className={styles.sortLabel}>Ordenar por</p>
        <div role="radiogroup" aria-labelledby="sheet-sort-label" className={styles.sortOptions}>
          {SORT_OPTIONS.map((option) => {
            const isChecked = sort.key === option.key && sort.direction === option.direction
            return (
              <button
                key={option.label}
                type="button"
                role="radio"
                aria-checked={isChecked}
                className={styles.sortOption}
                onClick={() => onSortChange({ key: option.key, direction: option.direction })}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className={styles.footer}>
        <button type="button" className={styles.clearButton} onClick={onClear}>Limpar</button>
        <button type="button" className={styles.seeButton} onClick={close}>
          Ver {resultCount} registros
        </button>
      </div>
    </dialog>
  )
}

export default FilterSheet
