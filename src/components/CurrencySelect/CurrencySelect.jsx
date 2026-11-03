import { useState } from 'react'
import { Check, ChevronDown, Search } from 'lucide-react'
import styles from './CurrencySelect.module.css'

function CurrencySelect({ id, label, pickerTitle, value, options, onChange, align = 'start' }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)

  const labelId = `${id}-label`
  const buttonId = `${id}-button`
  const listId = `${id}-list`
  const selected = options.find((option) => option.code === value)

  const search = query.trim().toLowerCase()
  const filtered = options.filter(
    (option) => option.code.toLowerCase().includes(search) || option.name.toLowerCase().includes(search),
  )
  const activeOption = filtered[activeIndex]

  function openPicker() {
    setQuery('')
    setActiveIndex(Math.max(0, options.findIndex((option) => option.code === value)))
    setOpen(true)
  }

  function closePicker({ returnFocus = false } = {}) {
    setOpen(false)
    if (returnFocus) document.getElementById(buttonId)?.focus()
  }

  function selectOption(code) {
    onChange(code)
    closePicker({ returnFocus: true })
  }

  function handleQueryChange(event) {
    setQuery(event.target.value)
    setActiveIndex(0)
  }

  function handleButtonKeyDown(event) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openPicker()
    }
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActiveIndex((index) => Math.min(index + 1, filtered.length - 1))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => Math.max(index - 1, 0))
    } else if (event.key === 'Enter' && activeOption) {
      event.preventDefault()
      selectOption(activeOption.code)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      closePicker({ returnFocus: true })
    }
  }

  // Close when focus leaves the whole component (click outside or Tab away).
  function handleBlur(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) closePicker()
  }

  return (
    <div className={styles.wrapper} onBlur={handleBlur}>
      <span id={labelId} className={styles.label}>{label}</span>
      <button
        type="button"
        id={buttonId}
        className={styles.button}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={`${labelId} ${buttonId}`}
        onClick={() => (open ? closePicker() : openPicker())}
        onKeyDown={handleButtonKeyDown}
      >
        <span className={styles.code}>{value}</span>
        {/* The name appears when the currency list arrives from the API. */}
        <span className={styles.name}>{selected?.name}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div className={`${styles.popover} ${align === 'end' ? styles.popoverEnd : ''}`}>
          <div className={styles.searchWrap}>
            <Search size={16} strokeWidth={1.75} className={styles.searchIcon} aria-hidden="true" />
            <input
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-activedescendant={activeOption ? `${id}-option-${activeOption.code}` : undefined}
              aria-label="Buscar por código ou nome"
              placeholder="Buscar por código ou nome"
              autoComplete="off"
              autoFocus
              className={styles.search}
              value={query}
              onChange={handleQueryChange}
              onKeyDown={handleSearchKeyDown}
            />
          </div>

          <ul id={listId} role="listbox" aria-label={pickerTitle} className={styles.list}>
            {filtered.map((option, index) => (
              <li
                key={option.code}
                id={`${id}-option-${option.code}`}
                role="option"
                aria-selected={option.code === value}
                className={`${styles.option} ${index === activeIndex ? styles.optionActive : ''}`}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => selectOption(option.code)}
              >
                <span className={styles.optionCode}>{option.code}</span>
                <span className={styles.optionName}>{option.name}</span>
                {option.code === value && <Check size={16} strokeWidth={2} className={styles.check} aria-hidden="true" />}
              </li>
            ))}
          </ul>

          {filtered.length === 0 && <p className={styles.empty}>Nenhuma moeda encontrada</p>}
        </div>
      )}
    </div>
  )
}

export default CurrencySelect
