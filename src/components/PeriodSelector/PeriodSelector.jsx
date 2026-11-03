import styles from './PeriodSelector.module.css'

function PeriodSelector({ options, value, onChange }) {
  return (
    <div role="group" aria-label="Período" className={styles.group}>
      {options.map((option) => (
        <button
          key={option.key}
          type="button"
          className={styles.option}
          aria-pressed={option.key === value}
          aria-label={option.longLabel}
          onClick={() => onChange(option.key)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default PeriodSelector
