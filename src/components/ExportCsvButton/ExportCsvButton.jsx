import { Download } from 'lucide-react'
import styles from './ExportCsvButton.module.css'

function ExportCsvButton() {
  return (
    <button type="button" className={styles.button}>
      <Download size={20} strokeWidth={1.75} aria-hidden="true" />
      Exportar CSV
    </button>
  )
}

export default ExportCsvButton
