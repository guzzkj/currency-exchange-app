import { RotateCcw } from 'lucide-react'
import styles from './Splash.module.css'
import ouriLoading from '../../assets/mascot/ouri-loading.svg'
import ouriError from '../../assets/mascot/ouri-error.svg'

// First screen while the currency list loads. Without it the app can't work,
// so an error here blocks the page and offers a retry.
function Splash({ status, onRetry }) {
  const isError = status === 'error'

  return (
    <div className={styles.splash} role="status" aria-live="polite">
      <img src={isError ? ouriError : ouriLoading} alt="" width="180" height="169" className={styles.mascot} />
      {isError ? (
        <>
          <p className={styles.errorText}>
            Não consegui buscar as cotações agora. Verifique a conexão e tente de novo.
          </p>
          <button type="button" className={styles.retry} onClick={onRetry}>
            <RotateCcw size={18} strokeWidth={1.75} aria-hidden="true" />
            Tentar de novo
          </button>
        </>
      ) : (
        <p className={styles.text}>Buscando cotações…</p>
      )}
    </div>
  )
}

export default Splash
