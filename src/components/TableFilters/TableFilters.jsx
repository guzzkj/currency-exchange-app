import styles from './TableFilters.module.css'

const RATE_FORMAT = { minimumFractionDigits: 4, maximumFractionDigits: 4 }

function TableFilters({ dateBounds, rateBounds }) {
  const fields = [
    { id: 'filter-from', label: 'De', type: 'date', min: dateBounds.start, max: dateBounds.end },
    { id: 'filter-to', label: 'Até', type: 'date', min: dateBounds.start, max: dateBounds.end },
    {
      id: 'filter-min',
      label: 'Cotação mín.',
      type: 'text',
      inputMode: 'decimal',
      placeholder: rateBounds.min.toLocaleString('pt-BR', RATE_FORMAT),
    },
    {
      id: 'filter-max',
      label: 'Cotação máx.',
      type: 'text',
      inputMode: 'decimal',
      placeholder: rateBounds.max.toLocaleString('pt-BR', RATE_FORMAT),
    },
  ]

  return (
    <div className={styles.filters}>
      {fields.map((field) => (
        <div key={field.id} className={styles.field}>
          <label htmlFor={field.id} className={styles.label}>{field.label}</label>
          <input
            id={field.id}
            type={field.type}
            inputMode={field.inputMode}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            className={styles.input}
          />
        </div>
      ))}
    </div>
  )
}

export default TableFilters
