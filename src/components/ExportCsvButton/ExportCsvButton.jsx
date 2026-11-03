import { useId, useState } from 'react'
import { Download } from 'lucide-react'
import styles from './ExportCsvButton.module.css'
import { getCsvFileName, toCsv } from '../../utils/csv'

const NO_RECORDS = 'Não há registros para exportar.'

// The browser keeps the file URL until it is revoked; the delay lets the download start.
const REVOKE_DELAY_MS = 1000

// Builds the file in the browser (Blob + temporary link), no server involved.
function downloadCsv(content, fileName) {
  const url = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), REVOKE_DELAY_MS)
}

// Exports exactly the rows the table shows: filtered and in the same order.
// With 0 rows it stays focusable (aria-disabled, not disabled) so the reason can be read:
// desktop shows a tooltip on hover/focus, mobile shows the text under the button (design).
function ExportCsvButton({ records, base, quote, layout = 'inline' }) {
  const [isTipVisible, setIsTipVisible] = useState(false)
  const reasonId = useId()
  const isDisabled = records.length === 0
  const isBlock = layout === 'block'

  function handleClick() {
    if (isDisabled) return
    downloadCsv(toCsv(records), getCsvFileName(base, quote, records))
  }

  const button = (
    <button
      type="button"
      className={isBlock ? styles.blockButton : styles.button}
      aria-disabled={isDisabled}
      aria-describedby={isDisabled ? reasonId : undefined}
      onClick={handleClick}
      onFocus={() => setIsTipVisible(true)}
      onBlur={() => setIsTipVisible(false)}
      // WCAG 1.4.13: the tooltip can be dismissed without moving the focus.
      onKeyDown={(event) => event.key === 'Escape' && setIsTipVisible(false)}
    >
      <Download size={20} strokeWidth={1.75} aria-hidden="true" />
      {isBlock ? `Exportar CSV (${records.length})` : 'Exportar CSV'}
    </button>
  )

  if (isBlock) {
    return (
      <div className={styles.bar}>
        {button}
        {isDisabled && <p id={reasonId} className={styles.reason}>{NO_RECORDS}</p>}
      </div>
    )
  }

  return (
    <div
      className={styles.wrap}
      onMouseEnter={() => setIsTipVisible(true)}
      onMouseLeave={() => setIsTipVisible(false)}
    >
      {button}
      {/* Always in the DOM while disabled (aria-describedby reads it); only shown on hover/focus. */}
      {isDisabled && (
        <div id={reasonId} role="tooltip" className={isTipVisible ? styles.tooltipVisible : styles.tooltip}>
          {NO_RECORDS}
        </div>
      )}
    </div>
  )
}

export default ExportCsvButton
