import { RotateCcw } from 'lucide-react'
import styles from './TableFilters.module.css'
import { formatCompactRate } from '../../utils/format'

// The 4 filter fields (RN10). Controlled: the values live in DataSection.
// layout 'bar': desktop row with "Limpar filtros" · 'sheet': 2 columns inside the mobile sheet.
// idPrefix keeps the ids unique, because the sheet has its own copy of the fields.
function TableFilters({
  filters,
  errors,
  onChange,
  onClear,
  dateBounds,
  rateBounds,
  layout = 'bar',
  idPrefix = 'filter',
}) {
  const fields = [
    { name: 'from', label: 'De', type: 'date', min: dateBounds.start, max: dateBounds.end },
    { name: 'to', label: 'Até', type: 'date', min: dateBounds.start, max: dateBounds.end },
    { name: 'min', label: 'Cotação mín.', type: 'text', inputMode: 'decimal', placeholder: formatCompactRate(rateBounds.min) },
    { name: 'max', label: 'Cotação máx.', type: 'text', inputMode: 'decimal', placeholder: formatCompactRate(rateBounds.max) },
  ]
  const hasFilter = Object.values(filters).some((value) => value !== '')

  return (
    <div className={layout === 'sheet' ? styles.sheetGrid : styles.filters}>
      {fields.map((field) => {
        const id = `${idPrefix}-${field.name}`
        const error = errors[field.name]
        return (
          <div key={field.name} className={styles.field}>
            <label htmlFor={id} className={styles.label}>{field.label}</label>
            <input
              id={id}
              type={field.type}
              inputMode={field.inputMode}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              value={filters[field.name]}
              onChange={(event) => onChange(field.name, event.target.value)}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${id}-error` : undefined}
              className={styles.input}
            />
            {error && (
              <p id={`${id}-error`} className={styles.error}>{error}</p>
            )}
          </div>
        )
      })}

      {layout === 'bar' && hasFilter && (
        <button type="button" className={styles.clear} onClick={onClear}>
          <RotateCcw size={16} strokeWidth={1.75} aria-hidden="true" />
          Limpar filtros
        </button>
      )}
    </div>
  )
}

export default TableFilters
